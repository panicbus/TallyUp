import posthog from 'posthog-js';

// Exactly two counters, nothing else: how often the check-in button and the
// staff confirm button get used. No autocapture, no pageviews (Vercel
// Analytics already covers those), no session recording, and
// person_profiles: 'never' so PostHog never creates a per-visitor profile —
// every event is anonymous by construction, not by convention. Missing
// VITE_POSTHOG_KEY (local dev, or before the key is configured in Vercel)
// leaves this a no-op rather than an error.
let initialized = false;

function init(): boolean {
  if (initialized) return true;
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key) return false;
  try {
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      person_profiles: 'never',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
    });
    initialized = true;
  } catch {
    // Analytics must never be the reason a check-in or a confirm fails.
  }
  return initialized;
}

function capture(eventName: 'checkin_submitted' | 'checkin_confirmed') {
  try {
    if (init()) posthog.capture(eventName);
  } catch {
    // swallow — see above
  }
}

export function trackCheckinSubmitted() {
  capture('checkin_submitted');
}

export function trackCheckinConfirmed() {
  capture('checkin_confirmed');
}
