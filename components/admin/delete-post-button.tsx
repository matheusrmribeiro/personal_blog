'use client';

import { deletePost } from '@/app/admin/actions';

export function DeletePostButton({ id }: { id: string }) {
  return (
    <form
      action={deletePost}
      onSubmit={(event) => {
        if (!window.confirm('Delete this post permanently?')) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-sm font-semibold text-red-700 hover:text-red-900"
      >
        Delete post
      </button>
    </form>
  );
}
