import { mdiOpenInNew } from '@mdi/js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeletePostButton } from '@/components/admin/delete-post-button';
import { PostEditor } from '@/components/admin/post-editor';
import { StatusPill } from '@/components/admin/status-pill';
import { MdiIcon } from '@/components/ui/mdi-icon';
import { getAdminPostById } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const post = await getAdminPostById(id);

  if (!post) {
    notFound();
  }

  const { saved } = await searchParams;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
              Edit post
            </p>
            <StatusPill status={post.status} />
          </div>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          {post.status === 'published' ? (
            <Link
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              href={`/posts/${post.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View post
              <MdiIcon path={mdiOpenInNew} className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          ) : null}
          <DeletePostButton id={post.id} />
        </div>
      </div>

      {saved ? (
        <p className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Post saved successfully.
        </p>
      ) : null}

      <PostEditor post={post} />
    </div>
  );
}
