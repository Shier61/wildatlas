import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Camera, ImageUp, Info, Loader2, RefreshCcw } from 'lucide-react'
import { FadeIn } from '@/components/MotionPrimitives'
import { IucnBadge, RiskBadge } from '@/components/species/StatusBadge'
import { identifySpecies } from '@/lib/api'
import { useLanguage } from '@/lib/i18n'
import type { IdentifyResponse } from '@/types/species'

export default function Identify() {
  const { lang, t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [response, setResponse] = useState<IdentifyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: identifySpecies,
    onSuccess: (data) => {
      setResponse(data)
      setError(null)
    },
    onError: () => {
      setError(t('errServer'))
    },
  })

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      setError(lang === 'zh' ? '图片超过 8MB，请压缩后再试' : 'Image exceeds 8MB, please compress it first')
      return
    }
    setResponse(null)
    setError(null)
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
    mutation.mutate(file)
  }

  const reset = () => {
    setPreview(null)
    setResponse(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="relative min-h-screen pb-20">
      {/* soft botanical background */}
      <div
        className="absolute inset-x-0 top-0 h-80 bg-cover bg-center opacity-90"
        style={{ backgroundImage: 'url(/hero/hero-plants.jpg)' }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-transparent via-[oklch(0.975_0.008_95/55%)] to-background" aria-hidden />

      <div className="container relative z-10 pt-32">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full glass-panel-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
              <Camera className="size-3.5 text-primary" />
              {t('identify')}
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">{t('identifyTitle')}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {t('identifyDesc')}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mx-auto mt-10 max-w-3xl">
            {!preview ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFile(e.dataTransfer.files?.[0])
                }}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-card/70 py-20 backdrop-blur-sm transition-colors hover:border-primary hover:bg-card"
              >
                <ImageUp className="size-10 text-primary" />
                <span className="text-base font-medium">{t('dropHere')}</span>
                <span className="text-xs text-muted-foreground">{t('formats')}</span>
              </button>
            ) : (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-3xl border border-border shadow-lg">
                  <img src={preview} alt={fileName} className="max-h-[460px] w-full object-cover" />
                  {mutation.isPending && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 rounded-full glass-panel px-5 py-2.5 text-sm font-medium">
                        <Loader2 className="size-4 animate-spin" />
                        {t('identifying')}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                  >
                    <RefreshCcw className="size-4" />
                    {t('reIdentify')}
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {error && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">{error}</p>
            )}

            {response && (
              <div className="mt-8 space-y-4">
                {response.mode === 'demo' && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-[oklch(0.85_0.08_90)] bg-[oklch(0.96_0.04_90)] p-4 text-sm leading-relaxed">
                    <Info className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
                    <span>{t('demoNotice')}</span>
                  </div>
                )}
                <h2 className="font-display text-xl font-bold">
                  {t('candidates')} · {response.result.length}
                </h2>
                <div className="space-y-3">
                  {response.result.map((c, i) => (
                    <div key={i} className="glass-panel rounded-2xl p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-lg font-bold">
                            {c.matched ? (lang === 'zh' ? c.matched.nameZh : c.nameEn) : c.nameZh || c.scientificName}
                          </p>
                          <p className="text-xs italic text-muted-foreground">
                            {c.scientificName}
                            {c.nameEn && lang === 'zh' ? ` · ${c.nameEn}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.matched && c.matched.category === 'plant' ? (
                            <RiskBadge risk={c.matched.invasiveRisk} native={c.matched.native} lang={lang} size="sm" />
                          ) : c.matched ? (
                            <IucnBadge status={c.matched.iucnStatus} lang={lang} size="sm" />
                          ) : null}
                          <span className="text-xs text-muted-foreground">
                            {t('confidence')} {Math.round(c.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.round(c.confidence * 100)}%` }}
                        />
                      </div>
                      {c.reasoning && <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{c.reasoning}</p>}
                      {c.matched && (
                        <Link
                          to={`/species/${c.matched.slug}`}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                        >
                          {t('viewDetail')} →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
