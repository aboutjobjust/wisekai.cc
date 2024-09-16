import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import solidJs from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import purgecss from 'astro-purgecss';
import robotsTxt from 'astro-robots-txt';
import { defineConfig } from 'astro/config';

import playformInline from '@playform/inline';

import playformCompress from '@playform/compress';

// https://astro.build/config
export default defineConfig({
  site: 'https://wisekai.cc',
  compressHTML: import.meta.env.PROD,
  integrations: [tailwind(), purgecss({
    safelist: {
      greedy: [/^splide/],
    },
    extractors: [
      {
        extractor: (content) =>
          content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
        extensions: ['astro', 'tsx', 'html'],
      },
    ],
  }), mdx(), solidJs(), icon(), robotsTxt(), sitemap(), playformInline(), playformCompress()],
  vite: {
    ssr: {
      noExternal: ['@splidejs'],
    },
  },
});