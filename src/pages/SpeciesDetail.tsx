import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bird, ChevronRight, Droplets, Leaf, MapPin, Sprout, TriangleAlert } from 'lucide-react'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { DistributionMap } from '@/components/species/DistributionMap'
import { IucnBadge, ProtectionTag, RiskBadge } from '@/components/species/StatusBadge'
import { useRelatedSpecies, useSpeciesDetail } from '@/hooks/use-species'
import { GROUP_LABELS, IUCN_LABELS, useLanguage } from '@/lib/i18n'
import { parseProvinces } from '@/lib/api'

export default function SpeciesDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { lang, t } = useLanguage()
  const { data: species, isLoading } = useSpeciesDetail(slug ?? '')
  const { data: related } = useRelatedSpecies(slug ?? '')

  if (isLoading) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center pt-20 text-sm text-muted-foreground">
        {t('loading')}
      </div>
    )
  }

  if (!species) {
    return (
      <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-4 pt-20 text-center">
        <p className="font-display text-2xl font-bold">{lang === 'zh' ? '未找到该物种' : 'Species not found'}</p>
        <Link to="/species" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <ArrowLeft className="size-4" />
          {t('backToIndex')}
        </Link>
      </div>
    )
  }

  const isPlant = species.category === 'plant'
  const name = lang === 'zh' ? species.nameZh : species.nameEn
  const altName = lang === 'zh' ? species.nameEn : species.nameZh
  const description = lang === 'zh' ? species.descriptionZh : species.descriptionEn
  const distributionText = lang === 'zh' ? species.distributionZh : species.distributionEn
  const habitat = lang === 'zh' ? species.habitatZh : species.habitatEn
  const threat = lang === 'zh' ? species.threatZh : species.threatEn
  const provinces = parseProvinces(species.distribution)

  return (
    <div>
      {/* Banner with species photo background */}
      <section className="relative h-[46vh] min-h-72 overflow-hidden">
        <img src={species.imageUrl || '/hero/hero-forest.jpg'} alt={name} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.2_0.04_155/70%)] via-[oklch(0.2_0.04_155/25%)] to-[oklch(0.2_0.04_155/35%)]" />
        <div className="container absolute inset-x-0 bottom-0 pb-8">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                  {isPlant ? (lang === 'zh' ? '植物 · PLANT' : 'PLANT') : lang === 'zh' ? '动物 · ANIMAL' : 'ANIMAL'}
                  {' · '}
                  {GROUP_LABELS[species.group]?.[lang] ?? species.group}
                </p>
                <h1 className="font-display text-4xl font-bold text-white text-shadow-hero md:text-5xl">{name}</h1>
                <p className="text-sm italic text-white/85">{species.scientificName} · {altName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <IucnBadge status={species.iucnStatus} lang={lang} />
                {isPlant ? (
                  <RiskBadge risk={species.invasiveRisk} native={species.native} lang={lang} />
                ) : (
                  species.chinaProtection && <ProtectionTag text={species.chinaProtection} />
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="container grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        {/* main column */}
        <div className="min-w-0 space-y-8">
          <FadeIn>
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link to="/species" className="hover:text-primary">{t('indexTitle')}</Link>
              <ChevronRight className="size-3" />
              <Link to={`/species?category=${species.category}`} className="hover:text-primary">
                {isPlant ? t('plants') : t('animals')}
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-foreground">{name}</span>
            </nav>
          </FadeIn>

          <FadeIn>
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <h2 className="mb-3 font-display text-xl font-bold">{lang === 'zh' ? '物种介绍' : 'About this species'}</h2>
              <p className="leading-loose text-[15px] text-foreground/85">{description}</p>
              {species.chinaProtection && (
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t('protectionLabel')}：</span>
                  {species.chinaProtection}
                </p>
              )}
            </div>
          </FadeIn>

          {/* distribution map */}
          <FadeIn>
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="size-4.5 text-primary" />
                <h2 className="font-display text-xl font-bold">{t('rangeLabel')}</h2>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{distributionText}</p>
              <DistributionMap provinces={provinces} speciesName={name} />
            </div>
          </FadeIn>

          {threat && (
            <FadeIn>
              <div className="rounded-2xl border border-[oklch(0.85_0.06_60)] bg-[oklch(0.96_0.03_80)] p-6">
                <div className="mb-2 flex items-center gap-2 text-[oklch(0.45_0.12_50)]">
                  <TriangleAlert className="size-4.5" />
                  <h2 className="font-display text-lg font-bold">{t('threatLabel')}</h2>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{threat}</p>
              </div>
            </FadeIn>
          )}

          {/* related */}
          {related && related.length > 0 && (
            <FadeIn>
              <h2 className="mb-4 font-display text-xl font-bold">{t('similarLabel')}</h2>
              <Stagger className="grid gap-4 sm:grid-cols-2" amount={0.1}>
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/species/${r.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-lg"
                  >
                    <img src={r.imageUrl} alt={r.nameZh} className="size-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{lang === 'zh' ? r.nameZh : r.nameEn}</p>
                      <p className="truncate text-xs italic text-muted-foreground">{r.scientificName}</p>
                      <div className="mt-1.5">
                        <IucnBadge status={r.iucnStatus} lang={lang} size="sm" />
                      </div>
                    </div>
                  </Link>
                ))}
              </Stagger>
            </FadeIn>
          )}
        </div>

        {/* sidebar facts */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <FadeIn>
            <div className="rounded-2xl border border-border bg-sidebar p-5 text-sm">
              <dl className="space-y-4">
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sprout className="size-3.5" />
                    {t('familyLabel')}
                  </dt>
                  <dd className="font-medium">{species.family}</dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Leaf className="size-3.5" />
                    {t('iucnLabel')}
                  </dt>
                  <dd className="font-medium">
                    {species.iucnStatus} · {IUCN_LABELS[species.iucnStatus]?.[lang] ?? species.iucnStatus}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {isPlant ? <Leaf className="size-3.5" /> : <Bird className="size-3.5" />}
                    {t('originLabel')}
                  </dt>
                  <dd>
                    {isPlant ? (
                      <RiskBadge risk={species.invasiveRisk} native={species.native} lang={lang} size="sm" />
                    ) : (
                      <span className="font-medium">
                        {lang === 'zh' ? (species.native ? '本土野生动物' : '外来野生动物') : species.native ? 'Native wildlife' : 'Introduced'}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Droplets className="size-3.5" />
                    {t('habitatLabel')}
                  </dt>
                  <dd className="leading-relaxed text-foreground/85">{habitat}</dd>
                </div>
              </dl>
            </div>
          </FadeIn>
        </aside>
      </div>
    </div>
  )
}
