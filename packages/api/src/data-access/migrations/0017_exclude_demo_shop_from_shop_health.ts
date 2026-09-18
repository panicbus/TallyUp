import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // 'demo' is the app's own built-in try-it-yourself preview
  // (CheckIn.tsx's DEMO_SLUG) — visiting /checkin/demo fakes a confirmed
  // result entirely client-side and never calls the real check-in API, so
  // this business has no staff, no customers, and can never have a visits
  // row. Left in, it would show as permanently, unfixably never_activated
  // in every future digest: noise, not a real pilot shop needing a
  // follow-up call. CREATE OR REPLACE requires restating the full
  // definition, not just the new clause.
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
      case
        when max(v.created_at) is null then 'never_activated'
        when max(v.created_at) > now() - interval '14 days' then 'active'
        when max(v.created_at) > now() - interval '45 days' then 'at_risk'
        else 'dormant'
      end as state
    from businesses b
    left join customers c on c.business_id = b.id
    left join visits v on v.business_id = b.id
    where b.slug != 'demo'
    group by b.id
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
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
}
