'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Finishing secure sign in…');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('error_description') || params.get('error')) {
      setMessage('This authentication link is invalid or has expired. Return to SharpMind and request a new one.');
      return () => { active = false; };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage('Authentication is temporarily unavailable. Please reopen SharpMind and try again.');
      return () => { active = false; };
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session) {
        setMessage('We could not confirm this authentication link. Please request a new link and try again.');
        return;
      }
      if (!data.session.user.email_confirmed_at) {
        router.replace(`/verify-email?email=${encodeURIComponent(data.session.user.email || '')}`);
        return;
      }
      router.replace(params.get('next') === '/login' ? '/login' : '/app');
    }).catch(() => {
      if (active) setMessage('We could not complete sign in. Check your connection and reopen the link.');
    });

    return () => { active = false; };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
      <section className="max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-3 text-2xl font-semibold">SharpMind authentication</h1>
        <p className="text-zinc-400" role="status" aria-live="polite">{message}</p>
      </section>
    </main>
  );
}
