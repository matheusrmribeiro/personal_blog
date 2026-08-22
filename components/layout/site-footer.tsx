import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-paper/65">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-xs sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>&copy; {new Date().getFullYear()} The Workbench.</p>
        <div className="flex items-center gap-5 font-mono uppercase tracking-[0.14em]">
          <p>Built with Next.js + Supabase</p>
          <Link className="hover:text-paper" href="/admin">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
