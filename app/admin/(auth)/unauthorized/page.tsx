import Link from 'next/link';
import { signOut } from '@/app/admin/actions';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === 'string' ? data.claims.email : 'this account';

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-6 text-zinc-100">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-300">
          Access not configured
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          This account is signed in, but it is not an administrator yet.
        </h1>
        <p className="mt-4 leading-7 text-zinc-400">
          Add <span className="text-zinc-200">{email}</span> to the blog’s
          administrator allowlist in Supabase. Once access is granted, continue
          directly to the studio.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-950"
          >
            Continue to studio
          </Link>
          <form action={signOut}>
            <button className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300">
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300"
          >
            Return to blog
          </Link>
        </div>
      </div>
    </main>
  );
}
