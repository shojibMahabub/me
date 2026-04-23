// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Change this to your production URL once the Netlify site is provisioned.
// Decap CMS previews and the sitemap both use it.
const SITE = 'https://mahabub.netlify.app';

export default defineConfig({
  site: SITE,
  integrations: [mdx(), sitemap()],
  build: {
    format: 'directory',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
        },
      },
    },
  },
});
