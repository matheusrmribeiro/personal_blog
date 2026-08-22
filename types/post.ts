import type { Tables } from './database';

export type Post = Tables<'posts'>;

export type PostStatus = 'draft' | 'published';

export type PostSummary = Pick<
  Post,
  | 'id'
  | 'title'
  | 'slug'
  | 'excerpt'
  | 'content'
  | 'cover_image_url'
  | 'published_at'
  | 'seo_title'
  | 'seo_description'
>;
