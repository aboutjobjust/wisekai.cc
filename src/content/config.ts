import { defineCollection, reference, z } from 'astro:content';

const kana = new RegExp('^[ぁ-んー]*$');

const voice = defineCollection({
  type: 'content',
  schema: z.object({
    text: z.string(),
    ruby: z.string().regex(kana),
    ytid: z.string(),
    start: z.number(),
    during: z.number(),
    gain: z.number().default(0),
    tag: z.array(reference('tag')).optional(),
  }),
});

const tag = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  voice,
  tag,
};
