'use client';

import { mdiClose, mdiFullscreen } from '@mdi/js';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MdiIcon } from '@/components/ui/mdi-icon';

type ExpandableImageProps = {
  alt: string;
  as?: 'div' | 'span';
  children: ReactNode;
  className?: string;
  src: string;
};

export function ExpandableImage({
  alt,
  as: Wrapper = 'div',
  children,
  className = '',
  src,
}: ExpandableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogTitleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeModal();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function closeModal() {
    setIsOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <Wrapper
        className={`group/expandable-image relative overflow-hidden ${className}`}
      >
        {children}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-black/0 transition-colors duration-200 group-hover/expandable-image:bg-black/40 group-focus-within/expandable-image:bg-black/40"
        />
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Expand image: ${alt}`}
          onClick={() => setIsOpen(true)}
          className="absolute inset-0 z-20 cursor-zoom-in rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="absolute top-3 right-3 grid size-10 place-items-center rounded-lg border border-white/30 bg-black/75 text-white opacity-100 shadow-lg transition hover:bg-black sm:opacity-0 sm:group-hover/expandable-image:opacity-100 sm:group-focus-within/expandable-image:opacity-100">
            <MdiIcon path={mdiFullscreen} className="size-5" />
          </span>
        </button>
      </Wrapper>

      {isOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-6 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeModal();
                }
              }}
            >
              <h2 id={dialogTitleId} className="sr-only">
                {alt}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                autoFocus
                aria-label="Close full-size image"
                onClick={closeModal}
                className="absolute top-5 right-5 z-10 grid size-11 place-items-center rounded-full border border-white/30 bg-black/70 text-white transition hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <MdiIcon path={mdiClose} className="size-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element -- the lightbox must display the original image at its natural resolution. */}
              <img
                src={src}
                alt={alt}
                className="max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)] rounded-2xl object-contain shadow-2xl"
                onMouseDown={(event) => event.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
