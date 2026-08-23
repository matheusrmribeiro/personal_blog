'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

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
          className="absolute top-3 right-3 z-20 grid size-10 place-items-center rounded-lg border border-white/30 bg-black/75 text-white opacity-100 shadow-lg transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:opacity-0 sm:group-hover/expandable-image:opacity-100 sm:group-focus-within/expandable-image:opacity-100"
        >
          <ExpandIcon />
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
                <CloseIcon />
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

function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" />
      <path d="m3 8 6-6M15 2l6 6M3 16l6 6M15 22l6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
