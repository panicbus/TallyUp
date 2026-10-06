import { describe, expect, it, vi } from 'vitest';
import { createPool } from './db.js';

describe('createPool', () => {
  it('survives an idle connection being terminated by the server', async () => {
    // Never connects: Pool connections are lazy, so a bogus URL is fine.
    const pool = createPool('postgres://unused:unused@localhost:1/unused');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Without a listener, EventEmitter throws on 'error', which is what
    // crashed the production process.
    expect(() => pool.emit('error', new Error('terminating connection due to administrator command'))).not.toThrow();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
    await pool.end();
  });
});
