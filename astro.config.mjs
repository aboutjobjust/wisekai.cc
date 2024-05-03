import svelte from '@astrojs/svelte'
import tailwind from '@astrojs/tailwind'
import purgecss from 'astro-purgecss'
import { defineConfig } from 'astro/config'

import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  site: 'https://wisekai.cc',
  trailingSlash: 'always',
  integrations: [tailwind(), svelte(), purgecss(), mdx()],
})
