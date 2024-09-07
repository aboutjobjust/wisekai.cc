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
    <div class="max-w-full flex-shrink-0">
      <a
        class="twitter-timeline block h-[600px] w-[500px]"
        data-lang="ja"
        data-width="500"
        data-height="600"
        aria-label="Tweets by isekaijoucho"
        href="https://twitter.com/isekaijoucho?ref_src=twsrc%5Etfw"
      ></a>
    </div>
  );
};
