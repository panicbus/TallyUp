import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import posthog from 'posthog-js';

const counters = vi.hoisted(() => ({ capture: vi.fn() }));

vi.mock('posthog-js', () => ({
  default: {
    // A named init returns its own instance; the unnamed (visits) init returns nothing we use.
    init: vi.fn((_key: string, _config: object, name?: string) => (name ? counters : undefined)),
    capture: vi.fn(),
  },
}));

describe('analytics', () => {
  beforeEach(() => {
    vi.stubEnv('PROD', true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('never throws and sends nothing when no PostHog key is configured', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', '');
    const { trackCheckinSubmitted, trackCheckinConfirmed, trackPageview } = await import('./analytics');

    expect(() => trackCheckinSubmitted()).not.toThrow();
    expect(() => trackCheckinConfirmed()).not.toThrow();
    expect(() => trackPageview('/')).not.toThrow();
    expect(posthog.init).not.toHaveBeenCalled();
    expect(counters.capture).not.toHaveBeenCalled();
  });

  it('sends nothing from a development build, even with a key', async () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { trackCheckinSubmitted, trackPageview } = await import('./analytics');

    trackCheckinSubmitted();
    trackPageview('/');

    expect(posthog.init).not.toHaveBeenCalled();
  });

  it('sends the check-in counter from its own memory-only instance with no profile', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { trackCheckinSubmitted } = await import('./analytics');

    trackCheckinSubmitted();

    expect(posthog.init).toHaveBeenCalledWith(
      'phc_test_key',
      expect.objectContaining({
        persistence: 'memory',
        person_profiles: 'never',
        autocapture: false,
        capture_pageview: false,
      }),
      'counters',
    );
    expect(counters.capture).toHaveBeenCalledWith('checkin_submitted');
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('captures the confirm counter under its own name', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { trackCheckinConfirmed } = await import('./analytics');

    trackCheckinConfirmed();

    expect(counters.capture).toHaveBeenCalledWith('checkin_confirmed');
  });

  it('counts a page visit through the visits instance', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    const { trackPageview } = await import('./analytics');

    trackPageview('/dashboard/joes-coffee');

    expect(posthog.init).toHaveBeenCalledWith(
      'phc_test_key',
      expect.objectContaining({ person_profiles: 'never', autocapture: false, capture_pageview: false }),
    );
    expect(posthog.capture).toHaveBeenCalledWith('$pageview');
  });

  it.each(['/checkin/joes-coffee', '/card'])(
    'never counts a visit to %s, a screen where customers type a phone number',
    async (path) => {
      vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
      const { trackPageview } = await import('./analytics');

      trackPageview(path);

      expect(posthog.init).not.toHaveBeenCalled();
      expect(posthog.capture).not.toHaveBeenCalled();
    },
  );

  it('does not throw even if capture itself throws', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_key');
    counters.capture.mockImplementationOnce(() => {
      throw new Error('network unavailable');
    });
    vi.mocked(posthog.capture).mockImplementationOnce(() => {
      throw new Error('network unavailable');
    });
    const { trackCheckinSubmitted, trackPageview } = await import('./analytics');

    expect(() => trackCheckinSubmitted()).not.toThrow();
    expect(() => trackPageview('/')).not.toThrow();
  });
});
