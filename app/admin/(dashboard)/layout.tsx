import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <AdminSidebar email={user.email} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
