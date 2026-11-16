import { z } from 'zod'

export const speciesListQuerySchema = z.object({
  category: z.enum(['plant', 'animal']).optional(),
  group: z.string().optional(),
  iucnStatus: z.string().optional(),
  invasiveRisk: z.string().optional(),
  origin: z.enum(['native', 'invasive']).optional(),
  keyword: z.string().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(['name', 'status', 'risk']).default('name'),
})

export const identifyRequestSchema = z.object({
  imageBase64: z.string().min(100),
  filename: z.string().max(255).optional(),
})

export type SpeciesListQuery = z.infer<typeof speciesListQuerySchema>
export type IdentifyRequest = z.infer<typeof identifyRequestSchema>
