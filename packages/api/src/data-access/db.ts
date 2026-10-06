import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './types.js';

export function createDb(connectionString: string): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: createPool(connectionString),
    }),
  });
}

export function createPool(connectionString: string): Pool {
  const pool = new Pool({ connectionString });
  // When the server drops an idle pooled connection (Supabase maintenance,
  // pooler restarts: "terminating connection due to administrator
  // command"), pg emits 'error' on the pool. With no listener, Node treats
  // that as an unhandled error and exits the whole process. pg has already
  // discarded the dead client, so logging is all that's needed; the next
  // query opens a fresh connection.
  pool.on('error', (err) => {
    console.error('Idle Postgres connection failed and was discarded:', err.message);
  });
  return pool;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}
