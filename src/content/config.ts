import { defineCollection, z } from 'astro:content';

const kana = new RegExp('^[ぁ-んー]*$');

const voiceCollection = defineCollection({
  type: 'content',
  schema: z.object({
    text: z.string(),
    ruby: z.string().regex(kana),
    start: z.number(),
    during: z.number(),
  }),
});

export const collections = {
  voice: voiceCollection,
};
