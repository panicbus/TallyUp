# ADR-0005: Usage analytics stay anonymous on customer-facing pages, and operator aggregates stay out of `public`

- **Status**: Accepted
- **Date**: 2026-09-17

## Context

There was no way to see whether the product was actually being used: no
record of how often the check-in button or the staff Confirm button gets
used, and no query surface for "which pilot shops are active versus gone
quiet" beyond hand-running SQL. Fixing this touches two things this codebase
is otherwise careful about:

1. `CONTEXT.md` and ADR-0004 establish that customers get minimal, deliberate
   data exposure. `/checkin/:slug` and `/card` are the two screens where a
   customer types a phone number, and `@vercel/analytics` had been running
   there, undisclosed, collecting ordinary visitor-level pageview data
   (referrer, device, approximate location) the whole time.
2. Every table in this database has RLS enabled with zero policies (ADR-0002)
   specifically because Supabase exposes the `public` schema to the anon key
   bundled in the web app. A naive cross-business aggregate view would
   reintroduce exactly the exposure that policy closes: Postgres views run as
   their *owner* by default, not the querying role, so a view over `businesses`
   /`visits` in `public` would bypass every base table's RLS and be reachable
   through PostgREST via the same anon key.

## Decision

**Customer-facing pages carry no visitor-level analytics, but do carry two
anonymous, property-less event counters.**

- `@vercel/analytics`'s automatic pageview collection is route-scoped
  (`App.tsx`'s `RouteScopedAnalytics`) to exclude `/checkin/:slug` and
  `/card` entirely. No pageview, referrer, device, or location data is
  collected on either page.
- PostHog captures exactly two named events, `checkin_submitted` and
  `checkin_confirmed`, fired once each on a successful check-in submission
  and a successful staff confirmation, with `person_profiles: 'never'` set
  at initialization so PostHog never creates a per-visitor profile, and no
  properties attached to either event. This is a plain tally, not a
  behavioral record: it cannot answer "who," only "how many."

**Operator-facing aggregates live in a dedicated `ops` schema, not `public`,**
with `usage` on that schema explicitly revoked from `anon` and
`authenticated`, and every view declared `with (security_invoker = true)` so
it runs as the querying role rather than its owner. Reads go through a
purpose-built, read-only Postgres role (`OPS_DATABASE_URL`) created by hand
outside migrations, never through the app's read-write connection.

## Rationale

**Why an anonymous click counter is a different decision than a visitor
tracker, not a smaller version of the same one.** A pageview event carries a
timestamp, a referrer, a device fingerprint, and (via IP) an approximate
location, tied to one visit. `checkin_submitted` carries none of that: no
properties, no profile, nothing that composes into a record of who did what,
when. The privacy exposure ADR-0004 already accepts (a guessable phone number
is a working key against the API) is unrelated to and unaffected by this: the
counters have no way to be joined to a phone number, a business, or a device,
even in principle, since none of that is ever sent.

**Why route-scope Vercel Analytics instead of just adding the PostHog
counters alongside it.** The two serve different, non-overlapping purposes.
Vercel's pageview collection answers "how many people visited," which is
visitor-level by construction. Nothing about wanting an anonymous click count
justifies also keeping a visitor-level record running on the same pages; the
two decisions are independent; excluding one doesn't require excluding the
other, and here it's excluded because nothing needs it.

**Why a separate schema and not RLS policies on the base tables.** RLS
governs which *rows* a role can see; it says nothing about who can execute a
cross-business `count()`/`group by`. Adding real RLS policies to `businesses`,
`visits`, etc. so an aggregate view could read across all of them safely
would mean writing and maintaining policies for every operator query shape,
against tables whose current zero-policy posture (ADR-0002) is deliberately
simple. Isolating the aggregate surface in its own ungranted schema is a
single, structural guarantee instead of a growing set of per-query policies.

**Why a separate read-only role instead of reusing `DATABASE_URL`.** The app's
own connection is read-write against every table. Routine analytics reads
(a human running a query, or the weekly shop-health digest running
unattended in CI) have no reason to hold write access to the pilot's only
copy of its data, and a credential scoped to `select` on one schema is a
credential that's actually reasonable to put in a CI secret.

**Why role creation isn't a migration.** It needs privileges the migration
role doesn't have (it isn't a superuser), and isn't naturally idempotent the
way an `up`/`down` migration should be. The exact SQL is recorded as a
comment in migration `0016` so it's discoverable and repeatable without being
part of the automated migration run.

## Consequences

- Vercel Analytics now undercounts total site traffic by the visits to
  `/checkin/:slug` and `/card`, on purpose. Anyone reading the Vercel
  dashboard should know those two pages are structurally excluded, not
  missing due to a bug.
- The two PostHog counters can never be broken down by business, device, or
  time of day beyond whatever PostHog's own dashboard infers from arrival
  time. If that granularity is ever wanted, it requires a deliberate,
  separate decision to attach a property, not a config tweak here, since the
  property-less design is the privacy guarantee.
- `ops.shop_health`'s `active`/`at_risk`/`dormant` thresholds (14 and 45
  days) are placeholders, not researched data, since the pilot doesn't have
  enough history yet to know real cadence. Nothing automated depends on
  them; they only order lines in a weekly email a human reads.
- A future session adding a new operator aggregate should extend the `ops`
  schema, not add a view to `public` for convenience. A future session
  wanting richer customer-facing analytics should treat that as reopening
  this ADR, not as an incremental addition to the two existing counters.
