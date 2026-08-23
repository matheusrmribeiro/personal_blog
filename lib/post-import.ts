import { z } from 'zod';

export const agentPostImportPrompt = `Write a complete blog post and return it as a downloadable post.json file. The file must contain one valid JSON object with exactly this shape:
{
  "version": 1,
  "title": "Post title (maximum 160 characters)",
  "slug": "lowercase-words-with-hyphens",
  "excerpt": "A useful summary (maximum 360 characters)",
  "content": "The complete post in Markdown",
  "cover_image_url": null,
  "seo_title": "Optional search title (maximum 70 characters)",
  "seo_description": "Optional search description (maximum 170 characters)"
}

Use Markdown in content and start section headings at level 2 (##), because the page title is level 1. Encode the Markdown as a valid JSON string, including escaped newlines. Use only HTTP or HTTPS for cover_image_url; use null if there is no real image URL. Optional fields may be null or omitted. Do not include publication status, commentary, or code fences outside the JSON object. Validate the JSON before returning the file.`;

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
    seo_title: optionalText(70),
    seo_description: optionalText(170),
  })
  .strict();

export type ImportedPost = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
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

  return {
    success: true,
    post: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverImageUrl: parsed.data.cover_image_url ?? '',
      seoTitle: parsed.data.seo_title ?? '',
      seoDescription: parsed.data.seo_description ?? '',
    },
  };
}

function stripCodeFence(source: string) {
  const trimmed = source.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);

  return match?.[1] ?? trimmed;
}
