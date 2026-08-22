import Link from 'next/link';
import { signOut } from '@/app/admin/actions';

export function AdminSidebar({ email }: { email: string }) {
  return (
    <aside className="border-b border-zinc-800 bg-zinc-950 text-zinc-100 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex min-h-20 items-center justify-between px-6 lg:block lg:min-h-0 lg:px-7 lg:py-8">
        <Link href="/admin" className="font-semibold tracking-tight">
          The Workbench<span className="text-lime-300">.</span>
        </Link>
        <span className="ml-3 rounded-full border border-zinc-700 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 lg:ml-0 lg:mt-3 lg:inline-block">
          Studio
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:px-4 lg:pb-0">
        <AdminLink href="/admin">Overview</AdminLink>
        <AdminLink href="/admin/posts">Posts</AdminLink>
        <AdminLink href="/admin/posts/new">New post</AdminLink>
        <AdminLink href="/" external>
          View site
        </AdminLink>
      </nav>

      <div className="hidden border-t border-zinc-800 px-7 py-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
        <p className="truncate text-xs text-zinc-500">{email}</p>
        <form action={signOut} className="mt-3">
          <button className="text-xs font-semibold text-zinc-300 hover:text-white">
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
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className="block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
    >
      {children}
      {external ? <span aria-hidden="true"> &#8599;</span> : null}
    </Link>
  );
}
