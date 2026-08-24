import type { Metadata } from 'next';
import { PostArchive } from '@/components/blog/post-archive';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { getPublishedPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Notes',
  description: 'All published notes from Workbench Notes.',
  alternates: { canonical: '/posts' },
};

export const revalidate = 60;

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
        <div className="max-w-5xl">
          <p className="eyebrow">The archive</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Notes
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Notes on software, design, creative practice, and building things
            that deserve to exist.
          </p>
        </div>

        {posts.length ? (
          <PostArchive posts={posts} />
        ) : (
          <div className="mt-14 border border-dashed border-line px-8 py-16 text-center text-muted">
            No published posts yet. Check back soon.
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
