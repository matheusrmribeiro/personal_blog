import { PostEditor } from '@/components/admin/post-editor';

export const dynamic = 'force-dynamic';

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
          New entry
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Write a post
        </h1>
      </div>
      <PostEditor />
    </div>
  );
}
