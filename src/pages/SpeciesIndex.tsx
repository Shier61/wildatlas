import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { SpeciesCard } from '@/components/species/SpeciesCard'
import { useSpeciesList } from '@/hooks/use-species'
import { GROUP_LABELS, IUCN_LABELS, useLanguage } from '@/lib/i18n'
import { api } from '@/lib/api'
import type { SpeciesFilter } from '@/types/species'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

interface GroupsMeta {
  groupsByCategory: Record<string, { key: string; count: number }[]>
}

const IUCN_ORDER = ['EX', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD']

export default function SpeciesIndex() {
  const { lang, t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [status, setStatus] = useState<string>('')
  const [origin, setOrigin] = useState<string>('')
  const [risk, setRisk] = useState<string>('')
  const [sort, setSort] = useState<'name' | 'status' | 'risk'>('name')
  const [page, setPage] = useState(1)

  const category = (searchParams.get('category') as 'plant' | 'animal' | null) ?? undefined
  const group = searchParams.get('group') ?? undefined

  const { data: groupsMeta } = useQuery<GroupsMeta>({
    queryKey: ['species-groups'],
    queryFn: async () => (await api.get('/species/meta/groups')).data,
  })

  const filter: SpeciesFilter = useMemo(
    () => ({
      category,
      group,
      iucnStatus: status || undefined,
      invasiveRisk: risk || undefined,
      origin: (origin as 'native' | 'invasive') || undefined,
      keyword: submittedKeyword || undefined,
      page,
      pageSize: 12,
      sort,
    }),
    [category, group, status, risk, origin, submittedKeyword, page, sort]
  )

  const { data, isFetching } = useSpeciesList(filter)

  const selectCategory = (c: 'plant' | 'animal' | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (c) next.set('category', c)
    else next.delete('category')
    next.delete('group')
    setSearchParams(next, { replace: true })
    setPage(1)
  }

  const selectGroup = (g: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (g) next.set('group', g)
    else next.delete('group')
    setSearchParams(next, { replace: true })
    setPage(1)
  }

  const resetAll = () => {
    setKeyword('')
    setSubmittedKeyword('')
    setStatus('')
    setOrigin('')
    setRisk('')
    setSort('name')
    setPage(1)
    setSearchParams({}, { replace: true })
  }

  const groupList = category
    ? groupsMeta?.groupsByCategory?.[category] ?? []
    : [
        ...(groupsMeta?.groupsByCategory?.plant ?? []),
        ...(groupsMeta?.groupsByCategory?.animal ?? []),
      ]

  return (
    <div className="container flex gap-6 py-24">
      {/* Sidebar filters */}
      <aside className="sticky top-24 hidden h-fit w-64 shrink-0 space-y-6 rounded-2xl border border-border bg-sidebar p-5 lg:block">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" />
          {t('filters')}
        </div>

        {/* category */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('category')}</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: undefined, label: t('allCategory') },
              { key: 'plant' as const, label: lang === 'zh' ? '植物' : 'Plants' },
              { key: 'animal' as const, label: lang === 'zh' ? '动物' : 'Animals' },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => selectCategory(opt.key)}
                className={cn(
                  'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  category === opt.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* groups */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {lang === 'zh' ? '细分类群' : 'Groups'}
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => selectGroup(undefined)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors',
                !group ? 'bg-sidebar-accent font-semibold text-sidebar-primary' : 'hover:bg-sidebar-accent/60'
              )}
            >
              {t('allCategory')}
            </button>
            {groupList.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => selectGroup(g.key)}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors',
                  group === g.key
                    ? 'bg-sidebar-accent font-semibold text-sidebar-primary'
                    : 'hover:bg-sidebar-accent/60'
                )}
              >
                <span>{GROUP_LABELS[g.key]?.[lang] ?? g.key}</span>
                <span className="text-[10px] text-muted-foreground">{g.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* status */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('status')}</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => { setStatus(''); setPage(1) }}
              className={cn(
                'cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors',
                !status ? 'border-primary bg-primary/10 font-semibold text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {t('allStatus')}
            </button>
            {IUCN_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStatus(s); setPage(1) }}
                className={cn(
                  'cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors',
                  status === s
                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {s} {IUCN_LABELS[s]?.[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* origin */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('origin')}</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: '', label: t('allOrigin') },
              { key: 'native', label: t('native') },
              { key: 'invasive', label: t('invasive') },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => { setOrigin(opt.key); setPage(1) }}
                className={cn(
                  'cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors',
                  origin === opt.key
                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* risk */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('invasiveRiskLabel')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: '', label: t('allOrigin') },
              { key: 'high', label: lang === 'zh' ? '高风险' : 'High' },
              { key: 'medium', label: lang === 'zh' ? '中风险' : 'Medium' },
              { key: 'watch', label: lang === 'zh' ? '需关注' : 'Watch' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => { setRisk(opt.key); setPage(1) }}
                className={cn(
                  'cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors',
                  risk === opt.key
                    ? 'border-primary bg-primary/10 font-semibold text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <RotateCcw className="size-3.5" />
          {t('resetFilters')}
        </button>
      </aside>

      {/* main list */}
      <main className="min-w-0 flex-1 space-y-6">
        <FadeIn>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold">
                {category === 'plant'
                  ? t('plants')
                  : category === 'animal'
                    ? t('animals')
                    : t('indexTitle')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.total ?? '—'} {t('resultCount')}
                {isFetching ? ` · ${t('loading')}` : ''}
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { setSubmittedKeyword(keyword); setPage(1) }
                  }}
                  onBlur={() => { setSubmittedKeyword(keyword); setPage(1) }}
                  placeholder={t('searchPlaceholder')}
                  className="h-10 w-64 rounded-full border border-input bg-card pl-9 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1) }}
                className="h-10 cursor-pointer rounded-full border border-input bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="name">{t('sortName')}</option>
                <option value="status">{t('sortStatus')}</option>
                <option value="risk">{t('sortRisk')}</option>
              </select>
            </div>
          </div>
        </FadeIn>

        {data && data.species.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            {t('noResult')}
          </div>
        ) : data && data.species.length > 0 ? (
          <Stagger key={`${category}-${group}-${status}-${origin}-${risk}-${submittedKeyword}-${page}`} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" amount={0.05}>
            {data.species.map((s) => <SpeciesCard key={s.slug} species={s} />)}
          </Stagger>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">{t('loading')}</div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pb-10">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
              {t('prevPage')}
            </button>
            <span className="text-sm tabular-nums text-muted-foreground">
              {page} / {data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('nextPage')}
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
