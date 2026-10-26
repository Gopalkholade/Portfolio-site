import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import dotenv from 'dotenv';

dotenv.config();

// Helper to guarantee a valid, standard URL format
function resolveSiteUrl() {
  const envUrl = process.env.SITE_URL?.trim();
  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      return parsed.origin;
    } catch {
      // Ignore malformed env strings and fall back
    }
  }
  // Standard valid fallback for GitHub Pages
  return 'https://gopalkholade.github.io';
}

export default defineConfig({
  output: 'static',
  site: resolveSiteUrl(),
  base: process.env.BASE_PATH || '/',
  integrations: [tailwind()],
});