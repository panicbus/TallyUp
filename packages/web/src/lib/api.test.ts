import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// api.ts had zero real test coverage before this file: the only test that
// touched the module (LegalPage.test.tsx) replaces it wholesale with
// vi.mock, so the real fetch code never ran under any existing test. These
// four pin down the riskiest current behavior before the request() refactor
// touches it — a uniform "throw on !ok" helper would silently break the
// first two.
vi.mock('./supabase', () => ({
  supabaseClient: { auth: { getSession: vi.fn() } },
}));

describe('api.ts', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('revokeInvite treats a 404 as success, not an error', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    const { supabaseClient } = await import('./supabase');
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
    } as never);
    const { revokeInvite } = await import('./api');

    await expect(revokeInvite('some-invite-id')).resolves.toBeUndefined();
  });

  it("createBusiness reads the response body to choose its 409 outcome, not the status alone", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: 'slug_taken' }), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const { supabaseClient } = await import('./supabase');
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
    } as never);
    const { createBusiness } = await import('./api');

    const result = await createBusiness({
      name: 'Test Shop',
      slug: 'taken-slug',
      rewardThreshold: 10,
      rewardDescription: 'Free thing',
      logoUrl: null,
    });

    expect(result).toEqual({ outcome: 'slug_taken' });
  });

  it('exportCustomersCsv resolves a Blob, not JSON', async () => {
    // Body is a plain string, not a pre-built Blob: jsdom's own Blob and
    // undici's (which Response/​.blob() use internally) are different
    // realms, and handing undici a jsdom Blob gets coerced to the literal
    // text "[object Blob]" instead of the real content. A string body has
    // no such ambiguity.
    fetchMock.mockResolvedValue(
      new Response('phone,points\n+15555550100,3', { status: 200, headers: { 'content-type': 'text/csv' } }),
    );
    const { supabaseClient } = await import('./supabase');
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    } as never);
    const { exportCustomersCsv } = await import('./api');

    const result = await exportCustomersCsv('some-shop');

    expect(result).toBeInstanceOf(Blob);
    expect(await result.text()).toBe('phone,points\n+15555550100,3');
  });

  it('sends the Bearer token from the session on an authenticated call', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'staff-1' }), { status: 200 }));
    const { supabaseClient } = await import('./supabase');
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'test-token-xyz' } },
    } as never);
    const { getMe } = await import('./api');

    await getMe();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token-xyz' });
  });
});
