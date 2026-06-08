/// <reference types="vite/client" />
import { useState } from 'react';
import { supabase, SUPABASE_URL } from '../lib/supabaseClient';

// Magic-link login. The email is sent by Supabase; clicking the link returns
// the user to this app (the redirect URL is configured in Supabase, see
// README.md). Authorisation is enforced server-side by Row-Level Security —
// only @persgroep.net addresses can read or write data.
export default function Auth() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  );
  const [message, setMessage] = useState('');

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
    }
  }

  // Google OAuth is the primary sign-in. On success Supabase redirects the
  // browser away, so there is no success state to set here.
  async function signInWithGoogle() {
    setStatus('sending');
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  // Surface mis-configuration clearly instead of a cryptic network error.
  if (SUPABASE_URL.startsWith('PASTE_')) {
    return (
      <div className="auth-card">
        <h1>Team OKRs</h1>
        <p className="notice">
          Not configured yet. Paste your Supabase Project URL and anon key into{' '}
          <code>src/lib/supabaseClient.ts</code> (see the README), then redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1>Team OKRs</h1>
      {status === 'sent' ? (
        <p className="notice">
          Check your inbox — we sent a sign-in link to <strong>{email}</strong>.
          Open it on this device to continue.
        </p>
      ) : (
        <>
          <button
            type="button"
            className="primary auth-google"
            onClick={signInWithGoogle}
            disabled={status === 'sending'}
          >
            Continue with Google
          </button>
          <div className="divider">
            <span>or</span>
          </div>
          <form onSubmit={sendLink}>
            <label htmlFor="email">Sign in with your work email</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@persgroep.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
            </button>
            {status === 'error' && <p className="error">{message}</p>}
          </form>
        </>
      )}
    </div>
  );
}
