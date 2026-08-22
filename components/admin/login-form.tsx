'use client';

import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      },
    });

    setIsPending(false);
    setMessage(
      error
        ? error.message
        : 'Check your email for a secure sign-in link. You can close this page.',
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="admin-label" htmlFor="email">
          Email address
        </label>
        <input
          className="admin-input mt-2"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <button className="admin-button w-full" type="submit" disabled={isPending}>
        {isPending ? 'Sending link…' : 'Email me a sign-in link'}
      </button>
      {message ? (
        <p className="text-sm leading-6 text-muted" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
