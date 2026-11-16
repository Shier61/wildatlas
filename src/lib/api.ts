import axios from 'axios'
import type {
  SpeciesDetail,
  SpeciesFilter,
  SpeciesListResponse,
  RelatedSpecies,
  StatsResponse,
  IdentifyResponse,
} from '@/types/species'

export const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
})

export async function fetchSpeciesList(filter: SpeciesFilter): Promise<SpeciesListResponse> {
  const { data } = await api.get<SpeciesListResponse>('/species', { params: filter })
  return data
}

export async function fetchSpeciesDetail(slug: string): Promise<SpeciesDetail> {
  const { data } = await api.get<{ species: SpeciesDetail }>(`/species/${slug}`)
  return data.species
}

export async function fetchRelatedSpecies(slug: string): Promise<RelatedSpecies[]> {
  const { data } = await api.get<{ related: RelatedSpecies[] }>(`/species/${slug}/related`)
  return data.related
}

export async function fetchStats(): Promise<StatsResponse> {
  const { data } = await api.get<StatsResponse>('/species/meta/stats')
  return data
}

export async function identifySpecies(file: File): Promise<IdentifyResponse> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
  const { data } = await api.post<IdentifyResponse>('/identify', {
    imageBase64: base64,
    filename: file.name,
  })
  return data
}

export async function fetchIdentifyStatus(): Promise<{ live: boolean; model: string | null }> {
  const { data } = await api.get('/identify/status')
  return data
}

export function parseProvinces(distribution: string): string[] {
  try {
    const parsed = JSON.parse(distribution)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
