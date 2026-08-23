import Link from 'next/link';
import { PostCard } from '@/components/blog/post-card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { getPublishedPosts } from '@/lib/posts';

export const revalidate = 60;

export default async function Home() {
  const posts = await getPublishedPosts(3);
  const [leadPost, ...morePosts] = posts;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-20 md:grid-cols-[1.15fr_0.85fr] md:items-end md:px-10 md:pb-24 md:pt-28">
          <div>
            <p className="eyebrow">Notes on building thoughtfully</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
              Ideas, experiments, and lessons from the workbench.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-muted md:pb-1">
            A personal journal about software, design, and the small decisions
            that make digital products feel considered.
          </p>
        </section>

        <section className="border-y border-line bg-surface/70">
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-12">
            {leadPost ? (
              <PostCard post={leadPost} featured />
            ) : (
              <div className="grid min-h-80 place-items-center border border-dashed border-line bg-paper/50 px-6 text-center">
                <div className="max-w-md">
                  <p className="eyebrow">The notebook is open</p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                    The first story is being written.
                  </h2>
                  <p className="mt-4 leading-7 text-muted">
                    Published essays will appear here as soon as they leave the
                    workbench.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {morePosts.length ? (
          <section
            id="notes"
            className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16 md:px-10 md:py-24"
          >
            <div className="mb-10 flex items-end justify-between gap-6 border-b border-line pb-5">
              <div>
                <p className="eyebrow">From the notebook</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                  Recent notes
                </h2>
              </div>
              <Link
                href="/posts"
                className="text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-ink"
              >
                View all
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {morePosts.map((post, index) => (
                <PostCard key={post.slug} post={post} index={index + 1} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-line bg-ink text-paper">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-end md:justify-between md:px-10 md:py-20">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/55">
                Stay curious
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                New notes, delivered occasionally.
              </h2>
            </div>
            <a
              href="mailto:hello@example.com?subject=Blog%20updates"
              className="inline-flex w-fit items-center gap-3 border-b border-paper/60 pb-2 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Join the reading list <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
