import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import dotenv from 'dotenv';

dotenv.config();

function resolveSiteUrl() {
  const envUrl = process.env.SITE_URL?.trim();
  if (envUrl) {
    try {
      const parsed = new URL(envUrl);
      return parsed.origin;
    } catch {
      // Fallback if parsing fails
    }
  }
  return 'https://gopalkholade.github.io';
}

export default defineConfig({
  output: 'static',
  site: resolveSiteUrl(),
  base: '/',
  integrations: [tailwind()],
});