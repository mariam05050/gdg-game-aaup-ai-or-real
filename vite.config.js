import { defineConfig } from 'vite';

export default defineConfig(({ command, isPreview }) => ({
  // Keep development at /; build and preview match the confirmed Pages URL.
  base: command === 'build' || isPreview ? '/gdg-game-aaup-ai-or-real/' : '/',
  server: {
    watch: {
      ignored: ['**/.tmp/**'],
    },
  },
}));
