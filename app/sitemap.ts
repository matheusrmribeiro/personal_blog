import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { siteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const latestPostDate = posts[0]?.published_at ?? undefined;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: new URL('/', siteUrl).toString(),
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL('/posts', siteUrl).toString(),
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: new URL('/about', siteUrl).toString(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: new URL(`/posts/${post.slug}`, siteUrl).toString(),
    lastModified: post.published_at ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.8,
    images: post.cover_image_url ? [post.cover_image_url] : undefined,
  }));

  return [...staticPages, ...postPages];
}
