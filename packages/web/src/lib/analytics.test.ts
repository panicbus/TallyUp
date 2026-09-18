import { afterEach, describe, expect, it, vi } from 'vitest';
import posthog from 'posthog-js';

vi.mock('posthog-js', () => ({
  default: { init: vi.fn(), capture: vi.fn() },
}));

describe('analytics', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('never throws when no PostHog key is configured (local dev)', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const { trackCheckinSubmitted, trackCheckinConfirmed } = await import('./analytics');

    expect(() => trackCheckinSubmitted()).not.toThrow();
    expect(() => trackCheckinConfirmed()).not.toThrow();
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('initializes anonymously and captures the check-in event when a key is present', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { trackCheckinSubmitted } = await import('./analytics');

    trackCheckinSubmitted();

    expect(posthog.init).toHaveBeenCalledWith(
      'phc_test_key',
      expect.objectContaining({ person_profiles: 'never', autocapture: false, capture_pageview: false }),
    );
    expect(posthog.capture).toHaveBeenCalledWith('checkin_submitted');
  });

  it('captures the confirm event under its own name', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { trackCheckinConfirmed } = await import('./analytics');

    trackCheckinConfirmed();

    expect(posthog.capture).toHaveBeenCalledWith('checkin_confirmed');
  });

  it('does not throw even if posthog.capture itself throws', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    vi.mocked(posthog.capture).mockImplementation(() => {
      throw new Error('network unavailable');
    });
    const { trackCheckinSubmitted } = await import('./analytics');

    expect(() => trackCheckinSubmitted()).not.toThrow();
  });
});
