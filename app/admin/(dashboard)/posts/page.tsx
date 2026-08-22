import Link from 'next/link';
import { StatusPill } from '@/components/admin/status-pill';
import { getAdminPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
            Content library
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Posts
          </h1>
        </div>
        <Link className="admin-button" href="/admin/posts/new">
          New post
        </Link>
      </div>

      <section className="admin-panel mt-8 overflow-hidden">
        {posts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-[0.12em] text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Updated</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-5">
                      <p className="max-w-lg truncate font-medium">{post.title}</p>
                      <p className="mt-1 max-w-lg truncate font-mono text-xs text-zinc-400">
                        /posts/{post.slug}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <StatusPill status={post.status} />
                    </td>
                    <td className="px-6 py-5 text-zinc-500">
                      {new Intl.DateTimeFormat('en', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }).format(new Date(post.updated_at))}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        className="font-semibold hover:underline"
                        href={`/admin/posts/${post.id}/edit`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <h2 className="text-xl font-semibold">Your library is empty.</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Start with a draft and publish when it feels ready.
            </p>
            <Link className="admin-button mt-6" href="/admin/posts/new">
              Create the first post
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
