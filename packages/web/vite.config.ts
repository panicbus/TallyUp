/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { isProjectApiKey } from './src/lib/posthog-key';

export default defineConfig(({ command, mode }) => {
  // Fail the build rather than ship a bundle that leaks a personal API key
  // and captures nothing. See src/lib/posthog-key.ts.
  const posthogKey = loadEnv(mode, process.cwd(), 'VITE_').VITE_POSTHOG_KEY;
  if (command === 'build' && posthogKey && !isProjectApiKey(posthogKey)) {
    throw new Error(
      'VITE_POSTHOG_KEY must be a PostHog project API key (starts with phc_). ' +
        'Copy it from PostHog Project Settings -> Project API Key.',
    );
  }

  return {
    plugins: [react()],
    test: {
      name: 'web',
      environment: 'jsdom',
      setupFiles: ['./src/test-support/setup.ts'],
    },
  };
});
