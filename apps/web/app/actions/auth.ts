'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOutAction(locale: string) {
  const cookieStore = await cookies();
  
  // Clear demo mode cookie if it exists
  if (cookieStore.get('demo_mode')) {
    cookieStore.delete('demo_mode');
  }

  // Clear Supabase session
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Redirect to login page
  redirect(`/${locale}/login`);
}
