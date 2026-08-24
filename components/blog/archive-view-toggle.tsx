'use client';

import { mdiViewGridOutline, mdiViewListOutline } from '@mdi/js';
import { useSyncExternalStore, type ReactNode } from 'react';
import { MdiIcon } from '@/components/ui/mdi-icon';

type ArchiveView = 'cards' | 'list';

const archiveViewStorageKey = 'workbench-notes:archive-view';
const archiveViewChangeEvent = 'workbench-notes:archive-view-change';
let fallbackView: ArchiveView = 'cards';

type ArchiveViewToggleProps = {
  cards: ReactNode;
  count: number;
  list: ReactNode;
};

const viewOptions = [
  { label: 'Cards', value: 'cards', icon: mdiViewGridOutline },
  { label: 'List', value: 'list', icon: mdiViewListOutline },
] as const;

function getArchiveView(): ArchiveView {
  try {
    const storedView = window.localStorage.getItem(archiveViewStorageKey);
    return storedView === 'list' ? 'list' : 'cards';
  } catch {
    return fallbackView;
  }
}

function getServerArchiveView(): ArchiveView {
  return 'cards';
}

function subscribeToArchiveView(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === archiveViewStorageKey || event.key === null) {
      document.documentElement.setAttribute(
        'data-archive-view',
        getArchiveView(),
      );
      onStoreChange();
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(archiveViewChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(archiveViewChangeEvent, onStoreChange);
  };
}

function saveArchiveView(view: ArchiveView) {
  fallbackView = view;
  document.documentElement.setAttribute('data-archive-view', view);

  try {
    window.localStorage.setItem(archiveViewStorageKey, view);
  } catch {
    // The in-memory fallback still keeps the toggle functional.
  }

  window.dispatchEvent(new Event(archiveViewChangeEvent));
}

export function ArchiveViewToggle({
  cards,
  count,
  list,
}: ArchiveViewToggleProps) {
  const view = useSyncExternalStore(
    subscribeToArchiveView,
    getArchiveView,
    getServerArchiveView,
  );

  return (
    <div className="mt-14">
      <div className="mb-6 flex items-center justify-between gap-6 border-b border-line pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {count} {count === 1 ? 'note' : 'notes'}
        </p>
        <div
          aria-label="Choose post view"
          className="inline-flex border border-line p-1"
          role="group"
        >
          {viewOptions.map((option) => {
            const isActive = view === option.value;

            return (
              <button
                key={option.value}
                aria-label={`${option.label} view`}
                aria-pressed={isActive}
                data-archive-view-option={option.value}
                className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  isActive
                    ? 'bg-contrast text-on-contrast'
                    : 'text-muted hover:bg-surface hover:text-ink'
                }`}
                onClick={() => saveArchiveView(option.value)}
                type="button"
              >
                <MdiIcon path={option.icon} className="size-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === 'cards' ? (
        <div data-archive-view-rendered="cards">{cards}</div>
      ) : (
        <div data-archive-view-rendered="list">{list}</div>
      )}
    </div>
  );
}
