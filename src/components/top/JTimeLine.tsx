import type { Component } from 'solid-js';
import { onMount } from 'solid-js';

export const JTimeLine: Component = () => {
  onMount(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;

    document.head.appendChild(script);
  });

  return (
    <div class="h-[600px] w-[500px] max-w-full flex-shrink-0">
      <a
        class="twitter-timeline relative -z-10 block h-full w-full rounded-md border border-gray-300"
        data-lang="ja"
        data-width="500"
        data-height="600"
        href="https://twitter.com/isekaijoucho?ref_src=twsrc%5Etfw"
      >
        <span class="loader">Tweets by isekaijoucho</span>
      </a>
    </div>
  );
};
