import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MarkdownContent } from '@/components/blog/markdown-content';
import { PostViewCounter } from '@/components/blog/post-view-counter';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ExpandableImage } from '@/components/ui/expandable-image';
import {
  estimateReadingTime,
  formatPostDate,
  getPublishedPostBySlug,
} from '@/lib/posts';

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return { title: 'Post not found' };
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
    twitter: {
      card: post.cover_image_url ? 'summary_large_image' : 'summary',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <article>
          <header className="mx-auto max-w-4xl px-6 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24">
            <Link
              href="/posts"
              className="font-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-ink"
            >
              &#8592; All notes
            </Link>
            <h1 className="mt-8 text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-8 text-muted">
              {post.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.14em] text-muted">
              <time dateTime={post.published_at ?? undefined}>
                {formatPostDate(post.published_at)}
              </time>
              <span aria-hidden="true">/</span>
              <span>{estimateReadingTime(post.content)}</span>
              <span aria-hidden="true">/</span>
              <PostViewCounter
                initialCount={post.view_count}
                slug={post.slug}
              />
            </div>
          </header>

          {post.cover_image_url ? (
            <ExpandableImage
              src={post.cover_image_url}
              alt={`Cover image for ${post.title}`}
              className="mx-auto aspect-[16/8] max-w-6xl rounded-2xl bg-ink"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${post.cover_image_url}")` }}
                role="img"
                aria-label={`Cover image for ${post.title}`}
              />
            </ExpandableImage>
          ) : null}

          <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
            <MarkdownContent content={post.content} />
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
