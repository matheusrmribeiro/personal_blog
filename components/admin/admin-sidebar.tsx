import {
  mdiFileDocumentMultiple,
  mdiFileDocumentPlus,
  mdiLogout,
  mdiOpenInNew,
  mdiViewDashboard,
} from '@mdi/js';
import Link from 'next/link';
import { signOut } from '@/app/admin/actions';
import { MdiIcon } from '@/components/ui/mdi-icon';

export function AdminSidebar({ email }: { email: string }) {
  return (
    <aside className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex min-h-20 items-center gap-2 px-6 lg:min-h-0 lg:px-7 lg:py-8">
        <Link
          href="/admin"
          className="whitespace-nowrap font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
        >
          Workbench Notes<span className="text-lime-300">.</span>
        </Link>
        <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          Studio
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:px-4 lg:pb-0">
        <AdminLink href="/admin" icon={mdiViewDashboard}>
          Overview
        </AdminLink>
        <AdminLink href="/admin/posts" icon={mdiFileDocumentMultiple}>
          Posts
        </AdminLink>
        <AdminLink href="/admin/posts/new" icon={mdiFileDocumentPlus}>
          New post
        </AdminLink>
        <AdminLink href="/" icon={mdiOpenInNew} external>
          View site
        </AdminLink>
      </nav>

      <div className="hidden border-t border-zinc-800 px-7 py-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
        <p className="truncate text-xs text-zinc-500">{email}</p>
        <form action={signOut} className="mt-3">
          <button className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300">
            <MdiIcon path={mdiLogout} className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function AdminLink({
  href,
  children,
  icon,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  icon: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
    >
      <MdiIcon path={icon} className="size-5 shrink-0" />
      {children}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </Link>
  );
}
