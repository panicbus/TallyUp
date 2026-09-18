-- Runs once when the postgres container's data volume is first created.
-- POSTGRES_DB (see docker-compose.yml) provisions the dev database; this
-- provisions a separate database for the integration test suite so test
-- runs never touch dev data.
CREATE DATABASE tallyup_test;

-- Supabase provisions these two roles automatically for PostgREST (anon =
-- the public API key bundled in the web app; authenticated = a signed-in
-- Supabase Auth user). Plain local Postgres has neither, so anything that
-- references them by name (e.g. migration 0016's `revoke ... from anon,
-- authenticated`, or a test asserting `has_schema_privilege('anon', ...)`)
-- would fail locally with "role does not exist" without this. NOLOGIN:
-- nothing ever connects as these roles locally, they only need to exist as
-- valid GRANT/REVOKE targets, matching how they're used against real
-- Supabase.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END
$$;
