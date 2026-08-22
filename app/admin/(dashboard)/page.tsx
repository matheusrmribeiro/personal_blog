import Link from 'next/link';
import { StatusPill } from '@/components/admin/status-pill';
import { getAdminPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const posts = await getAdminPosts();
  const published = posts.filter((post) => post.status === 'published').length;
  const drafts = posts.length - published;

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
            Publishing studio
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Overview
          </h1>
          <p className="mt-2 text-zinc-500">
            A clear view of what is live and what still needs work.
          </p>
        </div>
        <Link className="admin-button" href="/admin/posts/new">
          Write a new post
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Metric label="Total posts" value={posts.length} />
        <Metric label="Published" value={published} />
        <Metric label="Drafts" value={drafts} />
      </div>

      <section className="admin-panel mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <h2 className="font-semibold">Recently updated</h2>
            <p className="mt-1 text-sm text-zinc-500">Your latest writing activity.</p>
          </div>
          <Link className="text-sm font-semibold hover:underline" href="/admin/posts">
            View all
          </Link>
        </div>
        {posts.length ? (
          <div className="divide-y divide-zinc-200">
            {posts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between gap-6 px-6 py-4 hover:bg-zinc-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{post.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Updated {formatAdminDate(post.updated_at)}
                  </p>
                </div>
                <StatusPill status={post.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-zinc-500">No posts yet.</p>
            <Link
              href="/admin/posts/new"
              className="mt-3 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Create the first one
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-panel p-6">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-5 text-4xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
