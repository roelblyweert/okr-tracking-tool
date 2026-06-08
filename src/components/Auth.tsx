/// <reference types="vite/client" />
import { useState } from 'react';
import { supabase, SUPABASE_URL } from '../lib/supabaseClient';

// Magic-link login. The email is sent by Supabase; clicking the link returns
// the user to this app (the redirect URL is configured in Supabase, see
// README.md). Authorisation is enforced server-side by Row-Level Security —
// only @persgroep.net addresses can read or write data.
//
// Sign-in is invite-only: shouldCreateUser:false means a sign-in email is only
// sent to addresses that already exist as Supabase users. This stops anyone on
// the public internet from using the (public) anon key to trigger sign-in
// emails to arbitrary addresses. Add new team members from the Supabase
// dashboard (Authentication -> Users -> Add user / Invite). See README.
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
        // Invite-only: don't auto-create users from this public page.
        shouldCreateUser: false,
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
          {status === 'error' && (
            <>
              <p className="error">{message}</p>
              <p className="muted">
                Sign-in is invite-only. If you're on the team and don't have
                access yet, ask the OKR admin to add your <code>@persgroep.net</code>{' '}
                address in Supabase.
              </p>
            </>
          )}
        </form>
      )}
    </div>
  );
}
