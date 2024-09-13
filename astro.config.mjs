import mdx from '@astrojs/mdx';
import solidJs from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import purgecss from 'astro-purgecss';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://wisekai.cc',
  compressHTML: import.meta.env.PROD,
  integrations: [
    tailwind(),
    purgecss({
      extractors: [
        {
          extractor: (content) =>
            content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
          extensions: ['astro', 'tsx', 'html'],
        },
      ],
    }),
    mdx(),
    solidJs(),
    icon(),
  ],
});
