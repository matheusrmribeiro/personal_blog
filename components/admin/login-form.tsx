'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

type SignInMethod = 'password' | 'magic-link';

export function LoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<SignInMethod>('password');
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const supabase = createClient();

    if (method === 'password') {
      const password = String(formData.get('password') ?? '');
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (!error) {
        router.replace('/admin');
        router.refresh();
        return;
      }

      setIsPending(false);
      setMessage(error.message);
      return;
    }

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

  function selectMethod(nextMethod: SignInMethod) {
    setMethod(nextMethod);
    setMessage('');
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div
        aria-label="Sign-in method"
        className="grid grid-cols-2 rounded-lg bg-zinc-900 p-1"
        role="group"
      >
        <button
          aria-pressed={method === 'password'}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            method === 'password'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
          disabled={isPending}
          onClick={() => selectMethod('password')}
          type="button"
        >
          Password
        </button>
        <button
          aria-pressed={method === 'magic-link'}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
            method === 'magic-link'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
          disabled={isPending}
          onClick={() => selectMethod('magic-link')}
          type="button"
        >
          Email link
        </button>
      </div>
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
      {method === 'password' ? (
        <div>
          <label className="admin-label" htmlFor="password">
            Password
          </label>
          <input
            className="admin-input mt-2"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      ) : null}
      <button className="admin-button w-full" type="submit" disabled={isPending}>
        {method === 'password'
          ? isPending
            ? 'Signing in…'
            : 'Sign in'
          : isPending
            ? 'Sending link…'
            : 'Email me a sign-in link'}
      </button>
      {message ? (
        <p className="text-sm leading-6 text-muted" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
