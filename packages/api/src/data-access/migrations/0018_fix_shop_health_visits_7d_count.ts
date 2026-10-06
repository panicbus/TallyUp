import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // visits_7d was count(v.id), but the view joins customers and visits
  // side by side on business_id, so every visit row is repeated once per
  // customer: 3 visits at a shop with 4 customers counted as 12. distinct
  // collapses the fan-out, the same way customers already does. The other
  // columns (max, distinct counts) were never affected.
  await sql`
    create or replace view ops.shop_health as
    select
      b.id,
      b.name,
      b.slug,
      b.created_at,
      count(distinct c.id) as customers,
      count(distinct v.id) filter (where v.created_at > now() - interval '7 days') as visits_7d,
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
    where b.slug != 'demo'
    group by b.id
  `.execute(db);
}
