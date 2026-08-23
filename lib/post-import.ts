import { z } from 'zod';

export const agentPostImportPrompt = `Write a complete blog post and return it as a downloadable post.zip archive with this layout:
post.json
images/cover.webp
images/other-images.webp

The post.json file must contain one valid JSON object with exactly this shape:
{
  "version": 1,
  "title": "Post title (maximum 160 characters)",
  "slug": "lowercase-words-with-hyphens",
  "excerpt": "A useful summary (maximum 360 characters)",
  "content": "The complete post in Markdown. Reference bundled images like ![Useful alt text](images/example.webp)",
  "cover_image_url": null,
  "cover_image_path": "images/cover.webp",
  "seo_title": "Optional search title (maximum 70 characters)",
  "seo_description": "Optional search description (maximum 170 characters)"
}

Use Markdown in content and start section headings at level 2 (##), because the page title is level 1. Encode the Markdown as a valid JSON string, including escaped newlines. Put local JPG, PNG, WebP, or GIF files under images/ and reference them with relative paths—never file:// URLs or absolute paths. Use only letters, numbers, hyphens, and underscores in image filenames. Use cover_image_path for a bundled cover, or cover_image_url for an existing public HTTP/HTTPS image, but not both. Optional fields may be null or omitted. Do not include publication status, commentary, or code fences outside the JSON object. Validate post.json and the archive paths before returning the ZIP.`;

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).nullable().optional();

const optionalImageUrl = z
  .union([
    z.literal(''),
    z
      .string()
      .trim()
      .url('The cover image URL must be a valid URL.')
      .refine(
        (value) => /^https?:\/\//.test(value),
        'The cover image URL must use HTTP or HTTPS.',
      ),
    z.null(),
  ])
  .optional();

const optionalImagePath = z
  .string()
  .trim()
  .refine(isLocalImagePath, 'Use a relative image path such as images/cover.webp.')
  .nullable()
  .optional();

const importedPostSchema = z
  .object({
    version: z.literal(1),
    title: z.string().trim().min(1).max(160),
    slug: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'The slug must use lowercase letters, numbers, and hyphens.',
      )
      .optional(),
    excerpt: z.string().trim().min(1).max(360),
    content: z.string().min(1, 'The imported post must include content.'),
    cover_image_url: optionalImageUrl,
    cover_image_path: optionalImagePath,
    seo_title: optionalText(70),
    seo_description: optionalText(170),
  })
  .strict()
  .refine(
    (post) => !(post.cover_image_url && post.cover_image_path),
    {
      message: 'Use either cover_image_url or cover_image_path, not both.',
      path: ['cover_image_path'],
    },
  );

export type ImportedPost = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImagePath?: string;
  seoTitle: string;
  seoDescription: string;
};

export type PostImportResult =
  | { success: true; post: ImportedPost }
  | { success: false; error: string };

export function parseImportedPost(source: string): PostImportResult {
  let value: unknown;

  try {
    value = JSON.parse(stripCodeFence(source));
  } catch {
    return {
      success: false,
      error: 'This is not valid JSON. Ask the agent for a JSON file or paste only its JSON output.',
    };
  }

  const parsed = importedPostSchema.safeParse(value);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.join('.');

    return {
      success: false,
      error: field ? `${field}: ${issue.message}` : issue.message,
    };
  }

  const unsupportedImageReference = getMarkdownImageReferences(
    parsed.data.content,
  ).find(isUnsupportedLocalImageReference);

  if (unsupportedImageReference) {
    return {
      success: false,
      error: `content: Replace ${unsupportedImageReference} with a relative images/… path and include the file in the ZIP.`,
    };
  }

  return {
    success: true,
    post: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImageUrl: parsed.data.cover_image_url ?? '',
      coverImagePath: parsed.data.cover_image_path
        ? normalizeLocalImagePath(parsed.data.cover_image_path)
        : undefined,
      seoTitle: parsed.data.seo_title ?? '',
      seoDescription: parsed.data.seo_description ?? '',
    },
  };
}

export function getImportedImagePaths(post: ImportedPost) {
  const paths = new Set<string>();

  if (post.coverImagePath) {
    paths.add(post.coverImagePath);
  }

  for (const reference of getMarkdownImageReferences(post.content)) {
    if (isLocalImagePath(reference)) {
      paths.add(normalizeLocalImagePath(reference));
    }
  }

  return [...paths];
}

export function resolveImportedImagePaths(
  post: ImportedPost,
  publicUrls: ReadonlyMap<string, string>,
): ImportedPost {
  const content = post.content.replace(
    markdownImagePattern,
    (match, anglePath: string | undefined, plainPath: string | undefined) => {
      const reference = anglePath ?? plainPath;

      if (!reference || !isLocalImagePath(reference)) {
        return match;
      }

      const publicUrl = publicUrls.get(normalizeLocalImagePath(reference));
      return publicUrl ? match.replace(reference, publicUrl) : match;
    },
  );
  const coverImageUrl = post.coverImagePath
    ? publicUrls.get(post.coverImagePath) ?? ''
    : post.coverImageUrl;

  return {
    ...post,
    content,
    coverImageUrl,
    coverImagePath: undefined,
  };
}

function stripCodeFence(source: string) {
  const trimmed = source.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);

  return match?.[1] ?? trimmed;
}

const markdownImagePattern =
  /!\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^\s)\n]+))(?:\s+["'][^)\n]*["'])?\s*\)/g;

function getMarkdownImageReferences(content: string) {
  return [...content.matchAll(markdownImagePattern)].flatMap((match) => {
    const reference = match[1] ?? match[2];
    return reference ? [reference] : [];
  });
}

function isLocalImagePath(value: string) {
  const normalized = normalizeLocalImagePath(value);

  return (
    normalized.startsWith('images/') &&
    !normalized.includes('..') &&
    !normalized.includes('\\') &&
    /^[a-zA-Z0-9/_-]+\.(?:gif|jpe?g|png|webp)$/.test(normalized)
  );
}

function normalizeLocalImagePath(value: string) {
  return value.trim().replace(/^\.\//, '');
}

function isUnsupportedLocalImageReference(value: string) {
  if (isLocalImagePath(value) || /^https?:\/\//i.test(value) || value.startsWith('/')) {
    return false;
  }

  return (
    /^file:/i.test(value) ||
    /^[a-zA-Z]:[\\/]/.test(value) ||
    value.startsWith('.') ||
    /^[^:]+\.(?:gif|jpe?g|png|webp)(?:[?#].*)?$/i.test(value)
  );
}
