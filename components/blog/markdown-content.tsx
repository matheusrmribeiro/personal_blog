import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExpandableImage } from '@/components/ui/expandable-image';

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-blog">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt, ...props }) => {
            if (typeof src !== 'string' || !src) {
              return null;
            }

            return (
              <ExpandableImage
                as="span"
                src={src}
                alt={alt ?? 'Post image'}
                className={`mx-auto my-8 block rounded-2xl ${getImageWidth(src)}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Markdown images can use arbitrary author-provided public URLs. */}
                <img
                  {...props}
                  src={src}
                  alt={alt ?? ''}
                  className="!m-0 !w-full"
                />
              </ExpandableImage>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function getImageWidth(src: string) {
  if (src.endsWith('#size=small')) {
    return 'w-[40%]';
  }

  if (src.endsWith('#size=medium')) {
    return 'w-[70%]';
  }

  return 'w-full';
}
