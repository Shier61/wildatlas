import { Leaf, ShieldAlert } from 'lucide-react'
import { IUCN_LABELS, RISK_LABELS } from '@/lib/i18n'
import type { Language } from '@/lib/i18n'

// IUCN Red List category colours (traditional stoplight scheme)
const IUCN_STYLES: Record<string, string> = {
  EX: 'bg-[oklch(0.22_0_0)] text-[oklch(0.97_0_0)]',
  CR: 'bg-[oklch(0.45_0.19_25)] text-white',
  EN: 'bg-[oklch(0.60_0.20_35)] text-white',
  VU: 'bg-[oklch(0.72_0.15_70)] text-[oklch(0.25_0.04_60)]',
  NT: 'bg-[oklch(0.82_0.11_95)] text-[oklch(0.30_0.05_60)]',
  LC: 'bg-[oklch(0.55_0.11_155)] text-white',
  DD: 'bg-[oklch(0.55_0.01_260)] text-white',
}

const RISK_STYLES: Record<string, string> = {
  high: 'bg-[oklch(0.45_0.17_20)] text-white',
  medium: 'bg-[oklch(0.62_0.15_45)] text-white',
  watch: 'bg-[oklch(0.72_0.12_75)] text-[oklch(0.28_0.05_60)]',
}

interface IucnBadgeProps {
  status: string
  lang: Language
  size?: 'sm' | 'md'
}

export function IucnBadge({ status, lang, size = 'md' }: IucnBadgeProps) {
  const label = IUCN_LABELS[status]?.[lang] ?? status
  const style = IUCN_STYLES[status] ?? 'bg-muted text-foreground'
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium tracking-wide ${style} ${pad}`}
      title={lang === 'zh' ? `IUCN ${status}` : `IUCN ${status}`}
    >
      <span className="font-semibold">{status}</span>
      <span className="opacity-90">{label}</span>
    </span>
  )
}

interface RiskBadgeProps {
  risk: string | null
  native: boolean
  lang: Language
  size?: 'sm' | 'md'
}

/**
 * Plants: show invasion risk badge (or a native badge when no risk applies).
 */
export function RiskBadge({ risk, native, lang, size = 'md' }: RiskBadgeProps) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  if (risk) {
    const label = RISK_LABELS[risk]?.[lang] ?? risk
    const style = RISK_STYLES[risk] ?? 'bg-muted text-foreground'
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium ${style} ${pad}`}>
        <ShieldAlert className="size-3" />
        {label}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${pad} ${
        native
          ? 'bg-[oklch(0.55_0.11_155)] text-white'
          : 'bg-[oklch(0.62_0.15_45)] text-white'
      }`}
    >
      <Leaf className="size-3" />
      {native ? (lang === 'zh' ? '本土原生' : 'Native') : lang === 'zh' ? '外来种' : 'Introduced'}
    </span>
  )
}

export function ProtectionTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[oklch(0.75_0.11_82)] bg-[oklch(0.90_0.07_88)] px-2.5 py-1 text-xs font-medium text-[oklch(0.35_0.06_60)]">
      {text}
    </span>
  )
}
