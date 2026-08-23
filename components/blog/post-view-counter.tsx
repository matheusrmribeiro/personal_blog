'use client';

import { useEffect, useState } from 'react';

type PostViewCounterProps = {
  initialCount: number;
  slug: string;
};

export function PostViewCounter({
  initialCount,
  slug,
}: PostViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialCount);

  useEffect(() => {
    const controller = new AbortController();

    async function recordView() {
      try {
        const response = await fetch(
          `/api/posts/${encodeURIComponent(slug)}/view`,
          {
            method: 'POST',
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          return;
        }

        const result: unknown = await response.json();

        if (
          typeof result === 'object' &&
          result !== null &&
          'viewCount' in result &&
          typeof result.viewCount === 'number' &&
          Number.isSafeInteger(result.viewCount) &&
          result.viewCount >= 0
        ) {
          setViewCount(result.viewCount);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to refresh the post view count.');
        }
      }
    }

    void recordView();

    return () => controller.abort();
  }, [slug]);

  return (
    <span aria-live="polite">
      {new Intl.NumberFormat('en').format(viewCount)}{' '}
      {viewCount === 1 ? 'view' : 'views'}
    </span>
  );
}

