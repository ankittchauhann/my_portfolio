import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const work = defineCollection({
  loader: glob({ base: "./src/content/work", pattern: "**/*.mdx" }),
  schema: z.object({
    built: z.array(z.object({ label: z.string(), value: z.string() })),
    order: z.number(),
    role: z.string(),
    summary: z.string(),
    title: z.string(),
    years: z.string(),
  }),
});

export const collections = { work };
