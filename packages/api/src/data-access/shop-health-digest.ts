import './load-env.js';
import { Pool } from 'pg';
import { requireEnv } from './db.js';
import { createResendEmailPort } from './resend-email-port.js';
import { createConsoleEmailPort } from './console-email-port.js';
import type { EmailPort } from './email-port.js';

// Pause without touching code, the schedule, or the workflow file: set
// DIGEST_ENABLED=false as a repo variable. (Disabling the workflow itself
// from GitHub's Actions tab is the other way to pause, and undoes just as
// easily.)
if (process.env.DIGEST_ENABLED === 'false') {
  console.log('DIGEST_ENABLED=false, skipping this run.');
  process.exit(0);
}

interface ShopHealthRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  customers: string; // pg returns count(...) as text, not number
  visits_7d: string;
  last_visit_at: string | null;
  state: 'never_activated' | 'active' | 'at_risk' | 'dormant';
}

const STATE_ORDER: Record<ShopHealthRow['state'], number> = {
  dormant: 0,
  at_risk: 1,
  never_activated: 2,
  active: 3,
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function main() {
  // A dedicated read-only role (OPS_DATABASE_URL), never DATABASE_URL or
  // PROD_DATABASE_URL: this script only ever needs SELECT on one view, and
  // routine digest runs shouldn't go through a connection that can also
  // write. See migration 0016 for the role's setup.
  const pool = new Pool({ connectionString: requireEnv('OPS_DATABASE_URL') });
  const { rows } = await pool.query<ShopHealthRow>('select * from ops.shop_health');
  await pool.end();

  rows.sort((a, b) => STATE_ORDER[a.state] - STATE_ORDER[b.state]);

  // Always sends, one line per shop, every shop, every run: exception-only
  // alerting would need stored state to detect transitions, and makes
  // silence ambiguous between "all healthy" and "the job is broken." A
  // received email is its own heartbeat.
  const body =
    rows.length > 0
      ? rows
          .map((row) => {
            const lastVisit = row.last_visit_at ? new Date(row.last_visit_at).toLocaleDateString() : 'never';
            return `${row.state.toUpperCase().padEnd(16)} ${row.name} (${row.slug}): ${row.customers} customers, ${row.visits_7d} visits in the last 7 days, last visit ${lastVisit}.`;
          })
          .join('\n')
      : 'No shops in the database yet.';

  let emailPort: EmailPort;
  if (process.env.RESEND_API_KEY) {
    emailPort = createResendEmailPort(requireEnv('RESEND_API_KEY'), requireEnv('RESEND_FROM'));
  } else {
    emailPort = createConsoleEmailPort();
  }

  const to = requireEnv('DIGEST_TO');
  const result = await emailPort.send({
    to,
    subject: `TallyUp shop health, ${rows.length} shop${rows.length === 1 ? '' : 's'}`,
    text: body,
    html: `<pre style="font-family: ui-monospace, monospace; white-space: pre-wrap;">${escapeHtml(body)}</pre>`,
  });

  if (result.outcome === 'failed') {
    console.error(`Digest email failed to send: ${result.reason}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Digest sent to ${to}: ${rows.length} shop(s).`);
}

await main();
