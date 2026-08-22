import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="text-base font-semibold tracking-tight">
          The Workbench<span className="text-muted">.</span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-6 text-sm text-muted sm:gap-8">
            <li>
              <Link className="transition-colors hover:text-ink" href="/posts">
                Writing
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ink" href="/about">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
