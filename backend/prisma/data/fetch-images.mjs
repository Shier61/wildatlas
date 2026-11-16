// Fetch open-license species images from iNaturalist and download them locally.
// Output: frontend/public/species/<slug>.jpg + prisma/data/images.json (attribution map)
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'

const plants = JSON.parse(readFileSync(new URL('./plants.json', import.meta.url)))
const animals = JSON.parse(readFileSync(new URL('./animals.json', import.meta.url)))
const all = [...plants, ...animals]

const OUT_DIR = new URL('../../../frontend/public/species/', import.meta.url)
mkdirSync(OUT_DIR, { recursive: true })

const UA = 'WildAtlas/1.0 (biodiversity education project)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// accepted taxonomic synonyms / fallbacks for species iNaturalist indexes differently
const ALIASES = {
  'huagai-magnolia': ['Magnolia sinica'],
  'southern-yew': ['Taxus mairei'],
  'golden-camellia': ['Camellia petelotii'],
  'emei-michelia': ['Magnolia ernestii'],
  'giant-rhododendron': ['Rhododendron protistum var. giganteum'],
  'english-cordgrass': ['Sporobolus anglicus'],
  'field-sandbur': ['Cenchrus spinifex'],
  'yellow-breasted-bunting': ['Schoeniclus aureolus'],
  'naked-carp': ['Gymnocypris'],
  'camphor-tree': ['Camphora officinarum'],
  'water-hyacinth': ['Pontederia crassipes'],
  'smooth-cordgrass': ['Sporobolus alterniflorus'],
  'epazote': ['Dysphania ambrosioides'],
}

async function retry(fn, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      await sleep(1500 * (i + 1))
    }
  }
  return null
}

async function fetchJson(url) {
  const res = await retry(() => fetch(url, { headers: { 'User-Agent': UA } }))
  if (!res || !res.ok) return null
  return res.json().catch(() => null)
}

function nameCompatible(matched, queried) {
  const norm = (s) => s.toLowerCase().replace(/ (var\.|ssp\.|subsp\.|f\.) /g, ' ').split(/\s+/)
  const a = norm(matched)
  const b = norm(queried)
  return a[0] === b[0] && a[1] === b[1]
}

async function fetchTaxonPhoto(sciName, aliases = []) {
  const candidates = [sciName, ...aliases]
  // degrade: drop variety/subspecies, keep binomial
  if (/ (var\.|ssp\.|subsp\.) /i.test(sciName)) {
    candidates.push(sciName.replace(/ (var\.|ssp\.|subsp\.) .*$/i, ''))
  }
  for (const name of candidates) {
    const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=5&is_active=true`
    const data = await fetchJson(url)
    for (const taxon of data?.results || []) {
      const photo = taxon?.default_photo
      if (!photo || !photo.medium_url) continue
      const binomialOK = nameCompatible(taxon.name, sciName)
      const aliasOK = aliases.some((a) => nameCompatible(taxon.name, a) || taxon.name.toLowerCase() === a.toLowerCase())
      if (!binomialOK && !aliasOK && !isGenusQuery(name)) continue
      return {
        url: photo.medium_url,
        attribution: photo.attribution || 'iNaturalist',
      }
    }
  }
  return null
}

function isGenusQuery(name) {
  return name.trim().split(/\s+/).length === 1
}

async function download(url, dest) {
  const res = await retry(() => fetch(url, { headers: { 'User-Agent': UA } }))
  if (!res || !res.ok) return false
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 5000 || buf.length > 6_000_000) return false
  writeFileSync(dest, buf)
  return true
}

const prevMetaPath = new URL('./images.json', import.meta.url)
const loadMeta = () => {
  try {
    return JSON.parse(readFileSync(prevMetaPath).toString() || '{}')
  } catch {
    return {}
  }
}

const meta = {}
let ok = 0
for (const species of all) {
  const dest = new URL(`${species.slug}.jpg`, OUT_DIR).pathname
  if (existsSync(dest) && statSync(dest).size > 5000) {
    ok++
    meta[species.slug] = loadMeta()[species.slug] || { source: 'iNaturalist' }
    continue
  }
  const photo = await fetchTaxonPhoto(species.scientificName, ALIASES[species.slug] || [])
  const saved = photo ? await download(photo.url, dest) : false
  if (saved) {
    meta[species.slug] = { source: 'iNaturalist', attribution: photo.attribution }
    ok++
    console.log(`✓ ${species.nameZh}`)
  } else {
    meta[species.slug] = null
    console.log(`✗ ${species.nameZh} (${species.scientificName})`)
  }
  await sleep(300)
}

// merge previous meta to keep attributions for skipped files
for (const k of Object.keys(loadMeta())) {
  if (loadMeta()[k] && !meta[k]) meta[k] = loadMeta()[k]
}
writeFileSync(prevMetaPath, JSON.stringify(meta, null, 2))
console.log(`\n${ok}/${all.length} images saved`)
