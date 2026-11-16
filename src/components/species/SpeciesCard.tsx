import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Bird, Sprout } from 'lucide-react'
import type { SpeciesListItem } from '@/types/species'
import { GROUP_LABELS, useLanguage } from '@/lib/i18n'
import { HoverLift } from '@/components/MotionPrimitives'
import { IucnBadge, RiskBadge } from './StatusBadge'

interface Props {
  species: SpeciesListItem
}

export function SpeciesCard({ species }: Props) {
  const { lang } = useLanguage()
  const name = lang === 'zh' ? species.nameZh : species.nameEn
  const altName = lang === 'zh' ? species.nameEn : species.nameZh
  const group = GROUP_LABELS[species.group]?.[lang] ?? species.group
  const isPlant = species.category === 'plant'

  return (
    <HoverLift>
      <Link
        to={`/species/${species.slug}`}
        className="group block overflow-hidden rounded-xl bg-card shadow-md transition-shadow hover:shadow-xl"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {species.imageUrl ? (
            <img
              src={species.imageUrl}
              alt={`${name} ${species.scientificName}`}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              {isPlant ? <Sprout className="size-10" /> : <Bird className="size-10" />}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 bg-gradient-to-t from-black/55 to-transparent p-3 pt-8">
            {isPlant ? (
              <RiskBadge risk={species.invasiveRisk} native={species.native} lang={lang} size="sm" />
            ) : (
              <IucnBadge status={species.iucnStatus} lang={lang} size="sm" />
            )}
          </div>
          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-black/35 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
            {isPlant ? <Sprout className="mr-1 size-3" /> : <Bird className="mr-1 size-3" />}
            {group}
          </span>
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-display text-lg font-semibold leading-snug text-card-foreground">{name}</h3>
          <p className="text-xs italic text-muted-foreground">{species.scientificName}</p>
          <p className="truncate text-xs text-muted-foreground">{altName}</p>
          <motion.span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            {lang === 'zh' ? '查看详情' : 'View detail'}
            <ArrowUpRight className="size-3.5" />
          </motion.span>
        </div>
      </Link>
    </HoverLift>
  )
}
