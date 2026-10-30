// PostHog's capture endpoint only accepts a project API key (phc_). A
// personal API key (phx_) pasted into VITE_POSTHOG_KEY by mistake is a
// secret that Vite inlines into the public bundle, and every event sent with
// it is dropped without any warning in PostHog.
export function isProjectApiKey(key: string): boolean {
  return key.startsWith('phc_');
}
