'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

const postSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  title: z.string().trim().min(1, 'Add a title.').max(160),
  slug: z
    .string()
    .trim()
    .min(1, 'Add a slug.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and hyphens only.',
    ),
  excerpt: z.string().trim().min(1, 'Add a short excerpt.').max(360),
  content: z.string(),
  cover_image_url: z
    .string()
    .trim()
    .url()
    .refine((value) => /^https?:\/\//.test(value), 'Use an HTTP or HTTPS URL.')
    .optional()
    .or(z.literal('')),
  seo_title: z.string().trim().max(70).optional().or(z.literal('')),
  seo_description: z.string().trim().max(170).optional().or(z.literal('')),
  intent: z.enum(['draft', 'publish']),
});

export type PostActionState = {
  message: string;
  errors?: Record<string, string[]>;
};

export type PostImageActionResult =
  | { success: true; url: string }
  | { success: false; error: string };

export type DeletePostImageActionResult =
  | { success: true }
  | { success: false; error: string };

const allowedImageTypes = new Set([
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const extensionByType: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const maxImageSize = 5 * 1024 * 1024;

export async function uploadPostContentImage(
  formData: FormData,
): Promise<PostImageActionResult> {
  const { supabase, user } = await requireAdmin();
  const image = formData.get('image');

  if (!(image instanceof File) || image.size === 0) {
    return { success: false, error: 'Choose an image to upload.' };
  }

  if (!allowedImageTypes.has(image.type)) {
    return {
      success: false,
      error: 'Choose a JPG, PNG, WebP, or GIF image.',
    };
  }

  if (image.size > maxImageSize) {
    return {
      success: false,
      error: 'Images must be smaller than 5 MB.',
    };
  }

  const imagePath = `${user.id}/content/${crypto.randomUUID()}.${extensionByType[image.type]}`;
  const { error } = await supabase.storage
    .from('post-images')
    .upload(imagePath, image, {
      cacheControl: '31536000',
      contentType: image.type,
      upsert: false,
    });

  if (error) {
    return {
      success: false,
      error: `Unable to upload the image: ${error.message}`,
    };
  }

  const url = supabase.storage
    .from('post-images')
    .getPublicUrl(imagePath).data.publicUrl;

  return { success: true, url };
}

export async function deletePostContentImage(
  formData: FormData,
): Promise<DeletePostImageActionResult> {
  const { supabase } = await requireAdmin();
  const parsedUrl = z.string().url().safeParse(formData.get('url'));

  if (!parsedUrl.success) {
    return { success: false, error: 'The image URL is invalid.' };
  }

  const publicPathPrefix = '/storage/v1/object/public/post-images/';
  const { supabaseUrl } = getSupabaseConfig();
  const imageUrl = new URL(parsedUrl.data);

  if (
    imageUrl.origin !== new URL(supabaseUrl).origin ||
    !imageUrl.pathname.startsWith(publicPathPrefix)
  ) {
    return { success: false, error: 'This image is not managed by this blog.' };
  }

  const imagePath = decodeURIComponent(
    imageUrl.pathname.slice(publicPathPrefix.length),
  );
  const contentImagePath =
    /^[0-9a-f-]{36}\/content\/[0-9a-f-]{36}\.(?:gif|jpg|png|webp)$/i;

  if (!contentImagePath.test(imagePath)) {
    return { success: false, error: 'This image cannot be deleted here.' };
  }

  const { error } = await supabase.storage
    .from('post-images')
    .remove([imagePath]);

  if (error) {
    return {
      success: false,
      error: `Unable to delete the image: ${error.message}`,
    };
  }

  return { success: true };
}

export async function savePost(
  _previousState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const parsed = postSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    cover_image_url: formData.get('cover_image_url'),
    seo_title: formData.get('seo_title'),
    seo_description: formData.get('seo_description'),
    intent: formData.get('intent'),
  });

  if (!parsed.success) {
    return {
      message: 'Please check the highlighted fields.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.intent === 'publish' && !parsed.data.content.trim()) {
    return {
      message: 'A published post needs some content.',
      errors: { content: ['Write the post before publishing it.'] },
    };
  }

  const { supabase, user } = await requireAdmin();
  let coverImageUrl = parsed.data.cover_image_url || null;
  const image = formData.get('cover_image');

  if (image instanceof File && image.size > 0) {
    if (!allowedImageTypes.has(image.type)) {
      return {
        message: 'Choose a JPG, PNG, WebP, or GIF image.',
        errors: { cover_image: ['Unsupported image format.'] },
      };
    }

    if (image.size > maxImageSize) {
      return {
        message: 'The cover image must be smaller than 5 MB.',
        errors: { cover_image: ['Image is too large.'] },
      };
    }

    const imagePath = `${user.id}/${crypto.randomUUID()}.${extensionByType[image.type]}`;
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(imagePath, image, {
        cacheControl: '3600',
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        message: `Unable to upload the cover image: ${uploadError.message}`,
      };
    }

    coverImageUrl = supabase.storage
      .from('post-images')
      .getPublicUrl(imagePath).data.publicUrl;
  }

  const isPublishing = parsed.data.intent === 'publish';
  const payload = {
    author_id: user.id,
    title: parsed.data.title,
    slug: parsed.data.slug,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    cover_image_url: coverImageUrl,
    seo_title: parsed.data.seo_title || null,
    seo_description: parsed.data.seo_description || null,
    status: isPublishing ? 'published' : 'draft',
    published_at: isPublishing ? new Date().toISOString() : null,
  };

  let postId = parsed.data.id || null;
  let databaseError: { code?: string; message: string } | null = null;

  if (postId) {
    const { error } = await supabase.from('posts').update(payload).eq('id', postId);
    databaseError = error;
  } else {
    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select('id')
      .single();
    postId = data?.id ?? null;
    databaseError = error;
  }

  if (databaseError || !postId) {
    const message =
      databaseError?.code === '23505'
        ? 'That slug is already in use.'
        : databaseError?.message || 'Unable to save this post.';

    return {
      message,
      errors:
        databaseError?.code === '23505' ? { slug: [message] } : undefined,
    };
  }

  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath(`/posts/${parsed.data.slug}`);
  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  redirect(`/admin/posts/${postId}/edit?saved=1`);
}

export async function deletePost(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get('id'));

  if (!id.success) {
    return;
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('posts').delete().eq('id', id.data);

  if (error) {
    throw new Error(`Unable to delete the post: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  redirect('/admin/posts');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
