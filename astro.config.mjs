import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

import purgecss from "astro-purgecss";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte(), purgecss()]
});