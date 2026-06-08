import { useCallback, useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Minimal hand-rolled hash router for the two (someday more) top-level views.
//
// We use HASH routing (e.g. `#/roadmap`) because the app is a static SPA on
// GitHub Pages: the hash is purely client-side, survives a refresh, and needs
// no server rewrite / 404.html fallback.
//
// Adding a view later is a one-line change: add it to ROUTES below. Everything
// else (parsing, the union type, canonical writes) is derived from that map.
//
// CAUTION — Supabase magic-link auth ALSO lives in `location.hash`. After a
// magic-link click the redirect URL carries the session in the hash, e.g.
//   #access_token=...&refresh_token=...&expires_in=3600&type=magiclink
// Supabase reads that on load and strips it via history.replaceState. So this
// router NEVER rewrites a hash it does not recognise as one of our routes — it
// just falls back to the default view and leaves the URL alone for Supabase to
// finish cleaning. We only write a canonical hash in response to setView().
// ---------------------------------------------------------------------------

// The single source of truth. Add a view here and the rest follows.
const ROUTES = {
  list: '#/',
  roadmap: '#/roadmap',
} as const;

export type View = keyof typeof ROUTES;

const DEFAULT_VIEW: View = 'list';

// Reverse map (hash -> view) built once from ROUTES.
const HASH_TO_VIEW = new Map<string, View>(
  (Object.keys(ROUTES) as View[]).map((view) => [ROUTES[view], view]),
);

function readHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash;
}

// Map a raw hash to a known view, or null if it is not one of ours. A trailing
// empty hash ('' or just '#') is treated as the default view. Anything that
// doesn't match a known route (including Supabase auth tokens, which contain
// '=' and 'access_token'/'error') returns null so we leave the URL untouched.
function parseHash(hash: string): View | null {
  if (hash === '' || hash === '#') return DEFAULT_VIEW;
  return HASH_TO_VIEW.get(hash) ?? null;
}

export function useHashRoute(): [View, (view: View) => void] {
  // Initialise from the current hash, but render the default view for an
  // unrecognised hash WITHOUT rewriting it (Supabase auth hash safety).
  const [view, setViewState] = useState<View>(() => parseHash(readHash()) ?? DEFAULT_VIEW);

  useEffect(() => {
    function onHashChange() {
      const next = parseHash(readHash());
      // Only react to hashes we recognise; ignore foreign ones (e.g. a stray
      // auth hash) so we never fight Supabase's cleanup.
      if (next !== null) setViewState(next);
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Explicit user navigation: canonicalise the URL. We compare by resolved VIEW
  // (not the raw hash) so clicking the already-active tab is a no-op even when
  // the default view has two spellings ('' and '#/') — this avoids pushing a
  // junk history entry that would otherwise need an extra Back press to undo.
  // When we do write, location.hash fires a 'hashchange' that updates state via
  // the listener above; when we don't, we sync state directly. A foreign hash
  // (auth tokens, parseHash -> null) never equals a view, so an explicit click
  // always canonicalises it away — which is the desired, intentional behaviour.
  const setView = useCallback((next: View) => {
    if (parseHash(window.location.hash) === next) {
      setViewState(next);
    } else {
      window.location.hash = ROUTES[next];
    }
  }, []);

  return [view, setView];
}
