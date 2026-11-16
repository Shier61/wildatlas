import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="font-display text-7xl font-bold text-primary/25">404</p>
      <p className="font-display text-2xl font-bold">{t('notFound')}</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
      >
        <ArrowLeft className="size-4" />
        {t('backHome')}
      </Link>
    </div>
  )
}
