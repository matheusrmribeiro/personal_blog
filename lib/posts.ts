import { cache } from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { createPublicClient } from '@/lib/supabase/public';
import type { Post, PostSummary } from '@/types/post';

const publicPostFields =
  'id,title,slug,excerpt,content,cover_image_url,published_at,seo_title,seo_description,view_count' as const;

export const getPublishedPosts = cache(
  async (limit?: number): Promise<PostSummary[]> => {
    const supabase = createPublicClient();
    let query = supabase
      .from('posts')
      .select(publicPostFields)
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Unable to load published posts: ${error.message}`);
    }

    return data;
  },
);

export const getPublishedPostBySlug = cache(
  async (slug: string): Promise<PostSummary | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('posts')
      .select(publicPostFields)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to load post: ${error.message}`);
    }

    return data;
  },
);

export async function getAdminPosts(): Promise<Post[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Unable to load admin posts: ${error.message}`);
  }

  return data;
}

export async function getAdminPostById(id: string): Promise<Post | null> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load admin post: ${error.message}`);
  }

  return data;
}

export function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

export function formatPostDate(value: string | null) {
  if (!value) {
    return 'Unpublished';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
