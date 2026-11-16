import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { speciesListQuerySchema } from '../types/species.types'

export const speciesRouter = Router()

// Status severity ranking for sorting: EX is the most critical
const STATUS_SEVERITY: Record<string, number> = {
  EX: 6,
  CR: 5,
  EN: 4,
  VU: 3,
  NT: 2,
  LC: 1,
  DD: 0,
}

const RISK_SEVERITY: Record<string, number> = {
  high: 3,
  medium: 2,
  watch: 1,
}

/**
 * GET /api/species — paginated list with filters
 */
speciesRouter.get('/', async (req: Request, res: Response) => {
  const query = speciesListQuerySchema.parse(req.query)

  const where: Record<string, unknown> = {}
  if (query.category) where.category = query.category
  if (query.group) where.group = query.group
  if (query.iucnStatus) where.iucnStatus = query.iucnStatus
  if (query.invasiveRisk) where.invasiveRisk = query.invasiveRisk
  if (query.origin === 'native') where.native = true
  if (query.origin === 'invasive') where.native = false
  if (query.featured === 'true') where.featured = true
  if (query.keyword) {
    const kw = query.keyword.trim()
    if (kw) {
      where.OR = [
        { nameZh: { contains: kw } },
        { nameEn: { contains: kw } },
        { scientificName: { contains: kw } },
      ]
    }
  }

  const [total, rows] = await Promise.all([
    prisma.species.count({ where }),
    prisma.species.findMany({ where }),
  ])

  // Sort the filtered set first, then paginate
  const sorted = [...rows].sort((a, b) => {
    if (query.sort === 'status') {
      return (STATUS_SEVERITY[b.iucnStatus] ?? 0) - (STATUS_SEVERITY[a.iucnStatus] ?? 0)
    }
    if (query.sort === 'risk') {
      return (RISK_SEVERITY[b.invasiveRisk ?? ''] ?? -1) - (RISK_SEVERITY[a.invasiveRisk ?? ''] ?? -1)
    }
    return a.nameZh.localeCompare(b.nameZh, 'zh-Hans-CN')
  })

  const paged = sorted.slice((query.page - 1) * query.pageSize, query.page * query.pageSize)

  const species = paged.map((s) => ({
    slug: s.slug,
    category: s.category,
    group: s.group,
    nameZh: s.nameZh,
    nameEn: s.nameEn,
    scientificName: s.scientificName,
    family: s.family,
    native: s.native,
    invasiveRisk: s.invasiveRisk,
    iucnStatus: s.iucnStatus,
    chinaProtection: s.chinaProtection,
    imageUrl: s.imageUrl,
    featured: s.featured,
  }))

  res.json({
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    species,
  })
})

/**
 * GET /api/species/:slug — full detail
 */
speciesRouter.get('/:slug', async (req: Request, res: Response) => {
  const species = await prisma.species.findUnique({
    where: { slug: req.params.slug },
  })
  if (!species) {
    res.status(404).json({ error: 'Species not found' })
    return
  }
  res.json({ species })
})

/**
 * GET /api/species/:slug/related — same group, most threatened first
 */
speciesRouter.get('/:slug/related', async (req: Request, res: Response) => {
  const current = await prisma.species.findUnique({
    where: { slug: req.params.slug },
  })
  if (!current) {
    res.status(404).json({ error: 'Species not found' })
    return
  }
  const related = await prisma.species.findMany({
    where: {
      group: current.group,
      slug: { not: current.slug },
    },
    take: 4,
  })
  const sorted = related.sort(
    (a, b) => (STATUS_SEVERITY[b.iucnStatus] ?? 0) - (STATUS_SEVERITY[a.iucnStatus] ?? 0)
  )
  res.json({
    related: sorted.map((s) => ({
      slug: s.slug,
      nameZh: s.nameZh,
      nameEn: s.nameEn,
      scientificName: s.scientificName,
      iucnStatus: s.iucnStatus,
      invasiveRisk: s.invasiveRisk,
      imageUrl: s.imageUrl,
      category: s.category,
    })),
  })
})

/**
 * GET /api/stats — homepage statistics
 */
speciesRouter.get('/meta/stats', async (_req: Request, res: Response) => {
  const [total, plants, animals, threatened, invasive, featured] = await Promise.all([
    prisma.species.count(),
    prisma.species.count({ where: { category: 'plant' } }),
    prisma.species.count({ where: { category: 'animal' } }),
    prisma.species.count({ where: { iucnStatus: { in: ['VU', 'EN', 'CR', 'EX'] } } }),
    prisma.species.count({ where: { native: false } }),
    prisma.species.findMany({ where: { featured: true }, take: 8 }),
  ])
  res.json({
    total,
    plants,
    animals,
    threatened,
    invasive,
    featured: featured.map((s) => ({
      slug: s.slug,
      nameZh: s.nameZh,
      nameEn: s.nameEn,
      scientificName: s.scientificName,
      iucnStatus: s.iucnStatus,
      invasiveRisk: s.invasiveRisk,
      native: s.native,
      category: s.category,
      descriptionZh: s.descriptionZh,
      imageUrl: s.imageUrl,
    })),
  })
})

/**
 * GET /api/species/meta/groups — filter metadata for the sidebar
 */
speciesRouter.get('/meta/groups', async (_req: Request, res: Response) => {
  const rows = await prisma.species.findMany({
    select: { category: true, group: true },
  })
  const groupsByCategory: Record<string, { key: string; count: number }[]> = {
    plant: [],
    animal: [],
  }
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const key = `${r.category}:${r.group}`
    counts[key] = (counts[key] || 0) + 1
  }
  for (const [key, count] of Object.entries(counts)) {
    const [category, group] = key.split(':')
    groupsByCategory[category]?.push({ key: group, count })
  }
  for (const c of Object.keys(groupsByCategory)) {
    groupsByCategory[c].sort((a, b) => b.count - a.count)
  }
  res.json({ groupsByCategory })
})
