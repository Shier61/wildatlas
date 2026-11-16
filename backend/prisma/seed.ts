// Seed the WildAtlas database from the curated dataset.
// Usage: npx tsx prisma/seed.ts   (after `npx prisma migrate dev`)
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

const plants = JSON.parse(readFileSync(new URL('./data/plants.json', import.meta.url)))
const animals = JSON.parse(readFileSync(new URL('./data/animals.json', import.meta.url)))

const all = [...plants, ...animals]

async function main() {
  const count = await prisma.species.count()
  if (count > 0) {
    console.log(`Database already has ${count} species, reseeding...`)
    await prisma.species.deleteMany()
  }

  for (const s of all) {
    const imageExists = existsSync(new URL(`../../frontend/public/species/${s.slug}.jpg`, import.meta.url))
    await prisma.species.create({
      data: {
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
        distribution: JSON.stringify(s.distribution),
        distributionZh: s.distributionZh,
        distributionEn: s.distributionEn,
        habitatZh: s.habitatZh,
        habitatEn: s.habitatEn,
        descriptionZh: s.descriptionZh,
        descriptionEn: s.descriptionEn,
        threatZh: s.threatZh,
        threatEn: s.threatEn,
        imageUrl: imageExists ? `/species/${s.slug}.jpg` : '',
        featured: s.featured ?? false,
      },
    })
  }

  const total = await prisma.species.count()
  const plantsN = await prisma.species.count({ where: { category: 'plant' } })
  const animalsN = await prisma.species.count({ where: { category: 'animal' } })
  const threatened = await prisma.species.count({
    where: { iucnStatus: { in: ['VU', 'EN', 'CR', 'EX'] } },
  })
  const invasive = await prisma.species.count({ where: { native: false } })
  console.log(`Seeded ${total} species — ${plantsN} plants / ${animalsN} animals`)
  console.log(`Threatened (VU/EN/CR/EX): ${threatened}, invasive: ${invasive}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
