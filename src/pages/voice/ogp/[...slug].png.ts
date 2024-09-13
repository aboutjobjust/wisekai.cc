import { getOgImage } from '@lib/OgImage';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const voices = await getCollection('voice');

  return voices.map((voice) => ({
    params: { slug: voice.slug },
    props: { voice },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const text = props.voice.data.text as string;
  const body = await getOgImage(text);
  return new Response(body);
};
