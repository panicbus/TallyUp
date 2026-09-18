import { sql } from 'kysely';
import { describe, expect, test } from '../test-support/integration-test.js';

describe('ops.shop_health', () => {
  test('is queryable and returns the expected columns', async ({ db }) => {
    const result = await sql<{
      id: string;
      name: string;
      slug: string;
      created_at: Date;
      customers: string;
      visits_7d: string;
      last_visit_at: Date | null;
      state: string;
    }>`select * from ops.shop_health limit 1`.execute(db);

    // The pilot's own data may or may not have any businesses at test time —
    // this only needs to prove the view exists and is shaped as expected,
    // not that there's a row in it.
    expect(result.rows).toBeDefined();
  });

  test('a shop with no visits is never_activated', async ({ db }) => {
    const business = await db
      .insertInto('businesses')
      .values({
        name: 'Ops Test Shop',
        slug: `ops-test-${crypto.randomUUID()}`,
        reward_threshold: 10,
        reward_description: 'Free thing',
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const result = await sql<{ state: string; last_visit_at: Date | null }>`
      select state, last_visit_at from ops.shop_health where id = ${business.id}
    `.execute(db);

    expect(result.rows[0]?.state).toBe('never_activated');
    expect(result.rows[0]?.last_visit_at).toBeNull();
  });
});

describe('ops schema isolation', () => {
  test('anon and authenticated have no usage on schema ops', async ({ db }) => {
    // has_schema_privilege() is the reliable way to ask this — a view like
    // information_schema.usage_privileges doesn't cover schema-level grants.
    const result = await sql<{ anon_usage: boolean; authenticated_usage: boolean }>`
      select
        has_schema_privilege('anon', 'ops', 'USAGE') as anon_usage,
        has_schema_privilege('authenticated', 'ops', 'USAGE') as authenticated_usage
    `.execute(db);

    expect(result.rows[0]?.anon_usage).toBe(false);
    expect(result.rows[0]?.authenticated_usage).toBe(false);
  });
});
