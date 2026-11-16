import { Router, Request, Response } from 'express'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { identifyRequestSchema } from '../types/species.types'

export const identifyRouter = Router()

interface Candidate {
  scientificName: string
  nameZh: string
  nameEn: string
  confidence: number
  reasoning?: string
}

const PROMPT = `You are a biodiversity identification expert for a Chinese wildlife education platform. Analyse the photo and identify the most likely species.

Rules:
1. Return ONLY a JSON array (no markdown fences, no extra text) with at most 3 candidates.
2. Each element: { "scientificName": string, "nameZh": string (Chinese common name), "nameEn": string, "confidence": number between 0-1, "reasoning": string (brief, in Chinese) }.
3. Sort by confidence descending. Be honest: if the image is unclear, use low confidence values.
4. If the photo contains no plant or animal, return an empty array [].`

/**
 * Call an OpenAI-compatible vision model.
 */
async function callVisionModel(imageBase64: string): Promise<Candidate[] | null> {
  if (!env.AI_API_KEY) return null
  const baseUrl = (env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = env.AI_MODEL || 'gpt-4o-mini'
  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60_000)
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      console.error(`AI provider error: ${res.status} ${await res.text().catch(() => '')}`)
      return null
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content: string = data?.choices?.[0]?.message?.content ?? ''
    const jsonText = content.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(jsonText)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((c) => c && typeof c.scientificName === 'string')
        .slice(0, 3)
        .map((c) => ({
          scientificName: c.scientificName,
          nameZh: String(c.nameZh ?? ''),
          nameEn: String(c.nameEn ?? ''),
          confidence: Math.min(1, Math.max(0, Number(c.confidence) || 0)),
          reasoning: c.reasoning ? String(c.reasoning) : undefined,
        }))
    }
    return null
  } catch (e) {
    console.error('AI vision call failed:', e)
    return null
  }
}

/**
 * Match model output against the local database so results link to detail pages.
 */
async function matchToDatabase(candidates: Candidate[]) {
  const all = await prisma.species.findMany({
    select: { slug: true, scientificName: true, nameZh: true, nameEn: true, iucnStatus: true, invasiveRisk: true, native: true, category: true, imageUrl: true },
  })
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')
  return candidates.map((c) => {
    const sci = norm(c.scientificName)
    const zh = c.nameZh
    const en = norm(c.nameEn)
    const match = all.find((s) => {
      const sSci = norm(s.scientificName)
      return (
        sSci === sci ||
        sSci.includes(sci) ||
        sci.includes(sSci) ||
        (en && en === norm(s.nameEn)) ||
        (zh && s.nameZh === zh)
      )
    })
    return {
      ...c,
      matched: match
        ? {
            slug: match.slug,
            nameZh: match.nameZh,
            iucnStatus: match.iucnStatus,
            invasiveRisk: match.invasiveRisk,
            native: match.native,
            category: match.category,
            imageUrl: match.imageUrl,
          }
        : null,
    }
  })
}

/**
 * POST /api/identify — species recognition from an uploaded photo.
 * Accepts JSON: { imageBase64, filename }
 */
identifyRouter.post('/', async (req: Request, res: Response) => {
  const parsed = identifyRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: '请求中缺少或包含无效的图片数据' })
    return
  }
  const { imageBase64, filename } = parsed.data

  const live = await callVisionModel(imageBase64)
  const mode = live ? 'live' : 'demo'

  if (live) {
    const result = await matchToDatabase(live)
    await prisma.identifyRecord.create({
      data: {
        imageName: filename || 'upload',
        mode,
        result: JSON.stringify(result),
      },
    })
    res.json({ mode, result })
    return
  }

  // Demo mode: no API key configured (or provider unreachable).
  // Return three representative species so the interface stays explorable.
  const samples = await prisma.species.findMany({
    where: { slug: { in: ['giant-panda', 'crested-ibis', 'water-hyacinth'] } },
    select: { slug: true, scientificName: true, nameZh: true, nameEn: true, iucnStatus: true, invasiveRisk: true, native: true, category: true, imageUrl: true },
  })
  const demo = samples.map((s, i) => ({
    scientificName: s.scientificName,
    nameZh: s.nameZh,
    nameEn: s.nameEn,
    confidence: Number((0.92 - i * 0.25).toFixed(2)),
    reasoning: '演示模式结果：配置 AI_API_KEY 后即可进行真实识别。',
    matched: {
      slug: s.slug,
      nameZh: s.nameZh,
      iucnStatus: s.iucnStatus,
      invasiveRisk: s.invasiveRisk,
      native: s.native,
      category: s.category,
      imageUrl: s.imageUrl,
    },
  }))
  await prisma.identifyRecord.create({
    data: { imageName: filename || 'upload', mode, result: JSON.stringify(demo) },
  })
  res.json({ mode, result: demo })
})

/**
 * GET /api/identify/status — whether live AI is configured
 */
identifyRouter.get('/status', (_req: Request, res: Response) => {
  res.json({ live: Boolean(env.AI_API_KEY), model: env.AI_MODEL || null })
})
