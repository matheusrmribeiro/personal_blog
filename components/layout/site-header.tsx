import Link from 'next/link';
import { SiteLogo } from './site-logo';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          aria-label="Workbench Notes home"
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <SiteLogo />
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-4 text-sm text-muted sm:gap-8">
            <li>
              <Link className="transition-colors hover:text-ink" href="/posts">
                Notes
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-ink" href="/about">
                About
              </Link>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
