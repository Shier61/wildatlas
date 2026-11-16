export interface SpeciesListItem {
  slug: string
  category: 'plant' | 'animal'
  group: string
  nameZh: string
  nameEn: string
  scientificName: string
  family: string
  native: boolean
  invasiveRisk: 'high' | 'medium' | 'watch' | null
  iucnStatus: string
  chinaProtection: string | null
  imageUrl: string
  featured: boolean
}

export interface SpeciesDetail extends SpeciesListItem {
  distribution: string // JSON array of provinces
  distributionZh: string
  distributionEn: string
  habitatZh: string
  habitatEn: string
  descriptionZh: string
  descriptionEn: string
  threatZh: string | null
  threatEn: string | null
}

export interface SpeciesListResponse {
  total: number
  page: number
  pageSize: number
  totalPages: number
  species: SpeciesListItem[]
}

export interface RelatedSpecies {
  slug: string
  nameZh: string
  nameEn: string
  scientificName: string
  iucnStatus: string
  invasiveRisk: string | null
  imageUrl: string
  category: string
}

export interface StatsResponse {
  total: number
  plants: number
  animals: number
  threatened: number
  invasive: number
  featured: Array<
    Pick<SpeciesListItem, 'slug' | 'nameZh' | 'nameEn' | 'scientificName' | 'iucnStatus' | 'invasiveRisk' | 'native' | 'category'> & {
      descriptionZh: string
      imageUrl: string
    }
  >
}

export interface IdentifyCandidate {
  scientificName: string
  nameZh: string
  nameEn: string
  confidence: number
  reasoning?: string
  matched: {
    slug: string
    nameZh: string
    iucnStatus: string
    invasiveRisk: string | null
    native: boolean
    category: string
    imageUrl: string
  } | null
}

export interface IdentifyResponse {
  mode: 'live' | 'demo'
  result: IdentifyCandidate[]
}

export interface SpeciesFilter {
  category?: 'plant' | 'animal'
  group?: string
  iucnStatus?: string
  invasiveRisk?: string
  origin?: 'native' | 'invasive'
  keyword?: string
  page?: number
  pageSize?: number
  sort?: 'name' | 'status' | 'risk'
}
