import Link from 'next/link';
import {
  estimateReadingTime,
  formatPostDate,
} from '@/lib/posts';
import { ExpandableImage } from '@/components/ui/expandable-image';
import type { PostSummary } from '@/types/post';

type PostCardProps = {
  post: PostSummary;
  featured?: boolean;
  index?: number;
};

export function PostCard({ post, featured = false, index }: PostCardProps) {
  if (featured) {
    const featuredVisual = (
      <div
        className="relative flex min-h-72 items-end bg-ink p-7 text-paper sm:min-h-96 sm:p-10"
        style={
          post.cover_image_url
            ? {
                backgroundImage: `url("${post.cover_image_url}")`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
              }
            : undefined
        }
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink/85 to-ink/10"
        />
        <div className="relative z-10">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper/55">
            Featured note
          </span>
          <p className="mt-3 max-w-xs text-sm leading-6 text-paper/75">
            {post.excerpt}
          </p>
        </div>
      </div>
    );

    return (
      <article className="group grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-14">
        {post.cover_image_url ? (
          <ExpandableImage
            src={post.cover_image_url}
            alt={`Cover image for ${post.title}`}
            className="rounded-2xl"
          >
            {featuredVisual}
          </ExpandableImage>
        ) : (
          <div className="overflow-hidden rounded-2xl">{featuredVisual}</div>
        )}
        <div className="pb-2">
          <PostMeta post={post} />
          <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
            {post.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">
            {post.excerpt}
          </p>
          <ReadLink slug={post.slug} />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex min-h-80 flex-col justify-between border border-line p-7 transition-colors hover:bg-surface sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <PostMeta post={post} />
        {index ? (
          <span className="font-mono text-xs text-muted/65">
            {String(index).padStart(2, '0')}
          </span>
        ) : null}
      </div>
      <div className="mt-16">
        <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          {post.title}
        </h3>
        <p className="mt-4 leading-7 text-muted">{post.excerpt}</p>
        <ReadLink slug={post.slug} />
      </div>
    </article>
  );
}

function PostMeta({ post }: { post: PostSummary }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
      <time dateTime={post.published_at ?? undefined}>
        {formatPostDate(post.published_at)}
      </time>
      <span aria-hidden="true">/</span>
      <span>{estimateReadingTime(post.content)}</span>
    </div>
  );
}

function ReadLink({ slug }: { slug: string }) {
  return (
    <Link
      href={`/posts/${slug}`}
      className="mt-7 inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-sm font-semibold transition-colors group-hover:border-ink"
    >
      Read note <span aria-hidden="true">&#8594;</span>
    </Link>
  );
}
