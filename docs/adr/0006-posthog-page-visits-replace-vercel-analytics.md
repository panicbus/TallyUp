# ADR-0006: PostHog counts page visits in place of Vercel Analytics, and the counters stay unlinkable

- **Status**: Accepted (amends ADR-0005)
- **Date**: 2026-11-06

## Context

Nico wants visit numbers for TallyUp, Breakthru and the Panicbus Studios site
on one dashboard. TallyUp counted visits with `@vercel/analytics` and sent its
two anonymous counters (ADR-0005) to a PostHog project under a different
login. Everything now reports to the shared "Panicbus Studios" PostHog project,
where the Web analytics page switches between sites by domain.

## Decision

- **PostHog replaces Vercel Analytics for page visits.** `App.tsx`'s
  `PageviewTracker` sends one `$pageview` per route change through
  `lib/analytics.ts`. `@vercel/analytics` is removed.
- **The ADR-0005 exclusion stands.** `trackPageview` skips `/checkin/:slug`
  and `/card` (`isUntrackedPath`), so those screens get no visitor tracking.
- **The two counters run on their own PostHog instance** (named
  `counters`) with `persistence: 'memory'`. The visits instance keeps a
  random id in a cookie and local storage; if the counters shared it, a
  `checkin_submitted` could be joined to that visitor's earlier page views,
  breaking ADR-0005's "cannot be joined to a device." With memory-only
  persistence, each tally gets a throwaway id.
- **Both instances are quiet:** no person profiles, autocapture, page-leave
  events, heatmaps, dead-click or performance capture, surveys or session
  recording. Production builds only.
- **Events go through `/pbr/*` on our own domain**, rewritten to PostHog's US
  servers in `vercel.json`, so blockers that target posthog.com don't drop
  them.

## Consequences

- `VITE_POSTHOG_KEY` in Vercel now holds the Panicbus Studios project token.
  `VITE_POSTHOG_HOST` should be unset (the code defaults to `/pbr`).
- History from Vercel Analytics and from the old PostHog project stays where
  it was; the new project starts from this change.
- Without page-leave events, PostHog's bounce rate and session length for
  TallyUp are rougher than for a site that sends them.
