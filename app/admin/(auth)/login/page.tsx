import { mdiArrowLeft } from '@mdi/js';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { MdiIcon } from '@/components/ui/mdi-icon';
import { getAdminSession } from '@/lib/auth/admin';

export const metadata: Metadata = { title: 'Admin sign in' };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();

  if (session) {
    redirect('/admin');
  }

  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100 lg:grid-cols-2 lg:items-stretch lg:p-4">
      <section className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white"
          >
            <MdiIcon path={mdiArrowLeft} className="size-4" />
            Back to the blog
          </Link>
          <p className="mt-16 font-mono text-xs uppercase tracking-[0.18em] text-lime-300">
            Workbench Notes Studio
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em]">
            Welcome back.
          </h1>
          <p className="mt-4 max-w-sm leading-7 text-zinc-400">
            Sign in with your approved administrator account to write,
            preview, and publish posts.
          </p>
          {error ? (
            <p className="mt-5 rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <div className="[&_.admin-input]:border-zinc-700 [&_.admin-input]:bg-zinc-900 [&_.admin-input]:text-white [&_.admin-label]:text-zinc-300">
            <LoginForm />
          </div>
        </div>
      </section>
      <section className="hidden overflow-hidden rounded-2xl bg-lime-300 p-12 text-zinc-950 lg:flex lg:flex-col lg:justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.18em]">Private studio</p>
        <blockquote className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.035em]">
          “Write what should not be forgotten.”
        </blockquote>
        <p className="text-sm">Draft quietly. Publish deliberately.</p>
      </section>
    </main>
  );
}
