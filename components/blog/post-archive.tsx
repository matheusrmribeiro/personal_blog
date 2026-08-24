import Link from 'next/link';
import { ArchiveViewToggle } from '@/components/blog/archive-view-toggle';
import { PostCard } from '@/components/blog/post-card';
import { estimateReadingTime, formatPostDate } from '@/lib/post-metadata';
import type { PostSummary } from '@/types/post';

type PostArchiveProps = {
  posts: PostSummary[];
};

export function PostArchive({ posts }: PostArchiveProps) {
  return (
    <ArchiveViewToggle
      count={posts.length}
      cards={
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index + 1} />
          ))}
        </div>
      }
      list={
        <ol className="border-t border-line">
          {posts.map((post, index) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.slug}`}
                className="group grid gap-4 border-b border-line px-2 py-6 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:px-4"
              >
                <span className="font-mono text-xs text-muted/65">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-semibold tracking-tight sm:text-2xl">
                    {post.title}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-sm leading-6 text-muted">
                    {post.excerpt}
                  </span>
                </span>
                <span className="flex items-center gap-5 sm:justify-end">
                  <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.1em] text-muted sm:justify-end">
                    <time dateTime={post.published_at ?? undefined}>
                      {formatPostDate(post.published_at)}
                    </time>
                    <span aria-hidden="true">/</span>
                    <span>{estimateReadingTime(post.content)}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-lg transition-transform group-hover:translate-x-1"
                  >
                    &#8594;
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      }
    />
  );
}
