'use client';

import { useEffect } from 'react';

export function PostViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const controller = new AbortController();

    async function recordView() {
      try {
        await fetch(`/api/posts/${encodeURIComponent(slug)}/view`, {
          method: 'POST',
          signal: controller.signal,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to record the post view.');
        }
      }
    }

    void recordView();

    return () => controller.abort();
  }, [slug]);

  return null;
}
