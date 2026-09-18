import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // A separate schema, not `public`: Supabase exposes `public` through
  // PostgREST to the anon key bundled in the web app. `ops` is never granted
  // to anon/authenticated (the revoke below), so neither can even resolve
  // ops.shop_health as an object, let alone query it — this schema-level
  // revoke is the actual security boundary, checked before any view logic
  // runs, regardless of how the view itself is defined.
  await sql`create schema if not exists ops`.execute(db);
  await sql`revoke all on schema ops from anon, authenticated`.execute(db);

  // Deliberately the default (security_invoker = false, i.e. the view runs
  // as its owner against businesses/customers/visits), not true. This was
  // tried the other way first and doesn't work: every base table has RLS
  // enabled with zero policies (ADR-0002), which denies every role but the
  // table owner, so security_invoker = true would require tallyup_ops (the
  // read-only role below) to ALSO hold direct SELECT on those tables to
  // use the view at all — defeating the reason a restricted role exists.
  // The schema-level revoke above is what actually keeps anon/authenticated
  // out; that boundary doesn't depend on which mode the view runs in.
  await sql`
    create or replace view ops.shop_health as
    select
      b.id,
      b.name,
      b.slug,
      b.created_at,
      count(distinct c.id) as customers,
      count(v.id) filter (where v.created_at > now() - interval '7 days') as visits_7d,
      max(v.created_at) as last_visit_at,
      -- 14/45 days are placeholders, not researched: nothing is known yet
      -- about normal check-in cadence across shop types this early in the
      -- pilot. Revisit after a month or so of real digests. Nothing
      -- automated depends on these; they only sort lines in a weekly email.
      case
        when max(v.created_at) is null then 'never_activated'
        when max(v.created_at) > now() - interval '14 days' then 'active'
        when max(v.created_at) > now() - interval '45 days' then 'at_risk'
        else 'dormant'
      end as state
    from businesses b
    left join customers c on c.business_id = b.id
    left join visits v on v.business_id = b.id
    group by b.id
  `.execute(db);

  // Not executed here: role creation needs privileges this migration's
  // connection doesn't have (it runs as the app's table-owning user, not a
  // superuser), and isn't naturally idempotent the way an up/down migration
  // should be. Run once by hand in Supabase's SQL editor, as postgres, then
  // store the resulting connection string as OPS_DATABASE_URL: a GitHub
  // Actions secret for the weekly digest workflow, and optionally in local
  // .env for ad hoc queries. This keeps routine analytics reads off the
  // read-write DATABASE_URL/PROD_DATABASE_URL path entirely.
  //
  //   create role tallyup_ops login password '<generate one>';
  //   grant usage on schema ops to tallyup_ops;
  //   grant select on all tables in schema ops to tallyup_ops;
  //   alter default privileges in schema ops grant select on tables to tallyup_ops;
  //
  // Verify before trusting the credential anywhere — this must fail:
  //   set role tallyup_ops; select * from public.customers limit 1;
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`drop schema ops cascade`.execute(db);
}
