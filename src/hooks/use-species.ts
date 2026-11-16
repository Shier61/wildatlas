import { useQuery } from '@tanstack/react-query'
import {
  fetchSpeciesDetail,
  fetchSpeciesList,
  fetchRelatedSpecies,
  fetchStats,
  fetchIdentifyStatus,
} from '@/lib/api'
import type { SpeciesFilter } from '@/types/species'

export function useSpeciesList(filter: SpeciesFilter) {
  return useQuery({
    queryKey: ['species', filter],
    queryFn: () => fetchSpeciesList(filter),
  })
}

export function useSpeciesDetail(slug: string) {
  return useQuery({
    queryKey: ['species-detail', slug],
    queryFn: () => fetchSpeciesDetail(slug),
    enabled: Boolean(slug),
  })
}

export function useRelatedSpecies(slug: string) {
  return useQuery({
    queryKey: ['species-related', slug],
    queryFn: () => fetchRelatedSpecies(slug),
    enabled: Boolean(slug),
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })
}

export function useIdentifyStatus() {
  return useQuery({
    queryKey: ['identify-status'],
    queryFn: fetchIdentifyStatus,
  })
}
