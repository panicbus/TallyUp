import posthog, { type PostHog, type PostHogConfig } from 'posthog-js';

// Two separate PostHog instances, on purpose (ADR-0006, which amends ADR-0005):
//
// - Visits: one $pageview per screen, so we can see how many people use the
//   site. It never runs on /checkin/:slug or /card, the two screens where a
//   customer types a phone number.
// - Counters: exactly two tallies, check-in submitted and staff confirm. This
//   instance keeps nothing on the device (persistence: 'memory'), so every
//   tally gets a throwaway id and can never be joined to a visitor's page
//   views or to each other.
//
// Neither instance builds a person profile, autocaptures clicks, or records
// sessions. Production builds only; a missing VITE_POSTHOG_KEY makes all of
// this a no-op. Analytics must never be the reason a check-in or a confirm
// fails, so every call swallows its own errors.

// Same-origin path, proxied to PostHog by vercel.json so blockers don't drop it.
const API_HOST = import.meta.env.VITE_POSTHOG_HOST || '/pbr';

const QUIET: Partial<PostHogConfig> = {
  api_host: API_HOST,
  ui_host: 'https://us.posthog.com',
  person_profiles: 'never',
  autocapture: false,
  capture_pageview: false,
  capture_pageleave: false,
  capture_dead_clicks: false,
  capture_heatmaps: false,
  capture_performance: false,
  disable_session_recording: true,
  disable_surveys: true,
};

/** The screens where a customer types a phone number get no visitor tracking. */
export function isUntrackedPath(pathname: string): boolean {
  return pathname.startsWith('/checkin/') || pathname === '/card';
}

function projectKey(): string {
  return import.meta.env.PROD ? (import.meta.env.VITE_POSTHOG_KEY ?? '') : '';
}

let counters: PostHog | null = null;
let visitsReady = false;

function countersInstance(): PostHog | null {
  if (counters) return counters;
  const key = projectKey();
  if (!key) return null;
  counters = posthog.init(key, { ...QUIET, persistence: 'memory' }, 'counters') ?? null;
  return counters;
}

function visitsInstance(): boolean {
  if (visitsReady) return true;
  const key = projectKey();
  if (!key) return false;
  posthog.init(key, QUIET);
  visitsReady = true;
  return true;
}

function count(eventName: 'checkin_submitted' | 'checkin_confirmed') {
  try {
    countersInstance()?.capture(eventName);
  } catch {
    // swallow, see above
  }
}

export function trackCheckinSubmitted() {
  count('checkin_submitted');
}

export function trackCheckinConfirmed() {
  count('checkin_confirmed');
}

/** One page visit, unless it is a screen where customers type a phone number. */
export function trackPageview(pathname: string) {
  if (isUntrackedPath(pathname)) return;
  try {
    if (visitsInstance()) posthog.capture('$pageview');
  } catch {
    // swallow, see above
  }
}
