import { Link } from 'react-router-dom'
import { ArrowRight, Camera, Leaf, TrendingDown, Globe2, Bird, TreePine } from 'lucide-react'
import { FadeIn, Stagger } from '@/components/MotionPrimitives'
import { SpeciesCard } from '@/components/species/SpeciesCard'
import { useStats } from '@/hooks/use-species'
import { useLanguage } from '@/lib/i18n'


function StatCounter({ value }: { value: number | undefined }) {
  return <span className="font-display text-4xl font-bold tabular-nums">{value ?? '—'}</span>
}

export default function Index() {
  const { lang, t } = useLanguage()
  const { data: stats } = useStats()

  return (
    <div>
      {/* Hero — full-bleed forest background with glass panels */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero/hero-forest.jpg)' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0.04_155/45%)] via-[oklch(0.2_0.04_155/25%)] to-background" aria-hidden />

        <div className="container relative z-10 grid gap-8 pb-24 pt-32 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <FadeIn>
            <div className="max-w-2xl space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full glass-panel-soft px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
                <Globe2 className="size-3.5 text-primary" />
                {lang === 'zh' ? 'WildAtlas · 双语自然图鉴' : 'WildAtlas · Bilingual Nature Atlas'}
              </p>
              <h1 className="font-display text-5xl font-bold leading-[1.15] text-white text-shadow-hero md:text-6xl">
                {t('heroTitle')}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/90 text-shadow-hero md:text-lg">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/species"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
                >
                  {t('heroCta')}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/identify"
                  className="inline-flex items-center gap-2 rounded-full glass-panel px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
                >
                  <Camera className="size-4" />
                  {t('heroCtaAi')}
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* Stats glass card */}
          <FadeIn delay={0.15}>
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Leaf className="size-3.5" />
                    {t('statSpecies')}
                  </div>
                  <StatCounter value={stats?.total} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <TrendingDown className="size-3.5" />
                    {t('statThreatened')}
                  </div>
                  <StatCounter value={stats?.threatened} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <TreePine className="size-3.5" />
                    {t('statPlants')}
                  </div>
                  <StatCounter value={stats?.plants} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Bird className="size-3.5" />
                    {t('statAnimals')}
                  </div>
                  <StatCounter value={stats?.animals} />
                </div>
              </div>
              <div className="mt-7 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                {lang === 'zh'
                  ? '植物标注入侵风险或原生属性，动物标注 IUCN 濒危等级与国家保护级别。'
                  : 'Plants carry invasion-risk tags; animals carry IUCN status and national protection.'}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured species */}
      <section className="container py-16">
        <FadeIn>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground/80">
                {lang === 'zh' ? '精选物种' : 'Featured'}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold">
                {lang === 'zh' ? '从极危到入侵，走近它们的故事' : 'From Critically Endangered to Invasive'}
              </h2>
            </div>
            <Link to="/species" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex">
              {t('heroCta')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </FadeIn>

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" amount={0.05}>
          {stats?.featured?.slice(0, 8).map((s) => (
            <div key={s.slug} className="space-y-2">
              <SpeciesCard
                species={{
                  slug: s.slug,
                  category: s.category,
                  group: '',
                  nameZh: s.nameZh,
                  nameEn: s.nameEn,
                  scientificName: s.scientificName,
                  family: '',
                  native: s.native,
                  invasiveRisk: s.invasiveRisk,
                  iucnStatus: s.iucnStatus,
                  chinaProtection: null,
                  imageUrl: s.imageUrl,
                  featured: true,
                }}
              />
              <p className="line-clamp-2 px-1 text-xs leading-relaxed text-muted-foreground">
                {s.descriptionZh}
              </p>
            </div>
          ))}
        </Stagger>
      </section>

      {/* Two entry cards with photo backgrounds */}
      <section className="container pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          <FadeIn>
            <Link to="/species?category=plant" className="group relative block overflow-hidden rounded-2xl">
              <img
                src="/hero/hero-plants.jpg"
                alt=""
                className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.2_0.04_155/75%)] via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 glass-panel rounded-xl p-5">
                <h3 className="font-display text-xl font-bold">{lang === 'zh' ? '植物图鉴' : 'Plant Guide'}</h3>
                <p className="mt-1 text-sm text-foreground/75">
                  {lang === 'zh' ? '分辨谁是本土居民，谁是悄然扩张的入侵者。' : 'Tell natives from the invaders quietly spreading.'}
                </p>
              </div>
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Link to="/species?category=animal" className="group relative block overflow-hidden rounded-2xl">
              <img
                src="/hero/hero-wetland.jpg"
                alt=""
                className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.2_0.04_155/75%)] via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 glass-panel rounded-xl p-5">
                <h3 className="font-display text-xl font-bold">{lang === 'zh' ? '动物图鉴' : 'Animal Guide'}</h3>
                <p className="mt-1 text-sm text-foreground/75">
                  {lang === 'zh' ? '从极危到无危，了解每一个物种的保护刻度。' : 'Follow each species along the conservation scale.'}
                </p>
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
