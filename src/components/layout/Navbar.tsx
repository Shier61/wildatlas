import { Link, NavLink, useLocation } from 'react-router-dom'
import { Leaf, Camera, BookOpen, Info, TreePine } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', key: 'home' as const, icon: Leaf },
  { to: '/species?category=plant', key: 'plants' as const, icon: TreePine },
  { to: '/species?category=animal', key: 'animals' as const, icon: BookOpen },
  { to: '/identify', key: 'identify' as const, icon: Camera },
  { to: '/about', key: 'about' as const, icon: Info },
]

type NavLinkItem = (typeof links)[number]

function isActive(link: NavLinkItem, pathname: string, search: string): boolean {
  if (link.to === '/') return pathname === '/'
  if (link.to.startsWith('/species')) {
    // only highlight index pages (/species?category=...), not detail pages
    if (pathname !== '/species') return false
    const isAnimalTab = link.to.includes('category=animal')
    return new URLSearchParams(search).get('category') === 'animal' === isAnimalTab
  }
  return pathname === link.to
}

export function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const location = useLocation()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 glass-panel-soft">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="size-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold tracking-wide text-foreground">
              {t('brand')}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t('brandTagline')}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = isActive(link, location.pathname, location.search)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/80 hover:bg-primary/10 hover:text-primary'
                )}
              >
                {t(link.key)}
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border bg-background/60 p-0.5 text-xs font-semibold">
            {(['zh', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  'cursor-pointer rounded-full px-2.5 py-1 transition-colors',
                  lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {l === 'zh' ? '中' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center justify-around border-t border-border/60 py-1.5 md:hidden">
        {links.map((link) => {
          const active = isActive(link, location.pathname, location.search)
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-4" />
              {t(link.key)}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
