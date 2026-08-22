import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getAdminSession() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (adminError || !admin) {
    return null;
  }

  return {
    supabase,
    user: {
      id: userId,
      email:
        typeof claimsData.claims.email === 'string'
          ? claimsData.claims.email
          : 'Administrator',
    },
  };
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect('/admin/login');
  }

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (adminError || !admin) {
    redirect('/admin/unauthorized');
  }

  return {
    supabase,
    user: {
      id: userId,
      email:
        typeof claimsData.claims.email === 'string'
          ? claimsData.claims.email
          : 'Administrator',
    },
  };
}
