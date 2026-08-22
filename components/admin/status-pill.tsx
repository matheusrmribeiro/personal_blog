import type { Post } from '@/types/post';

export function StatusPill({ status }: { status: Post['status'] }) {
  const published = status === 'published';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
        published
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-amber-100 text-amber-800'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}
