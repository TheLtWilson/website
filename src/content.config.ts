import { glob } from 'astro/loaders'
import { airtableLoader } from '@ascorbic/airtable-loader'
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog'}),
  schema: ({ image }) =>
    z.object({
      title: z
        .string()
        .max(
          60,
          'Title should be 60 characters or less for optimal Open Graph display.',
        ),
      description: z
        .string()
        .max(
          155,
          'Description should be 155 characters or less for optimal Open Graph display.',
        ),
      date: z.coerce.date(),
      image: image().optional(),
      tags: z.array(z.string()).optional(),
      authors: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
      disableComments: z.boolean().optional()
    }),
})

const authors = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/authors' }),
  schema: z.object({
    name: z.string(),
    pronouns: z.string().optional(),
    avatar: z.string().url(),
    bio: z.string().optional(),
    mail: z.string().email().optional(),
    website: z.string().url().optional(),
    twitter: z.string().url().optional(),
    bluesky: z.string().url().optional(),
    youtube: z.string().url().optional(),
    twitch: z.string().url().optional(),
    instagram: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    discord: z.string().url().optional(),
  }),
})

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      image: image().optional(),
      link: z.string().url(),
      license: z.string().optional(),
      github_repo: z.string().optional(),
    }),
})

const vods = defineCollection({
  loader: airtableLoader({
    base: import.meta.env.AIRTABLE_BASE,
    table: import.meta.env.AIRTABLE_TABLE,
    token: import.meta.env.AIRTABLE_TOKEN,
    queryParams: {
      view: import.meta.env.AIRTABLE_VIEW
    }
  }),
  schema: z.object({
    'Title': z.string(),
    'Stream Date': z.coerce.date(),
    'Duration': z.string(),
    'Game': z.string(),
    'Game Cover URL': z.string().url(),
    'VOD URL': z.string().url(),
    'Thumbnail URL': z.string().url(),
    'Chat Replay URL': z.string().url().optional()
  })
})

export const collections = { blog, authors, projects, vods }
