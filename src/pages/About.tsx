import { Database, GitBranch, Leaf, ScrollText, ShieldAlert } from 'lucide-react'
import { FadeIn } from '@/components/MotionPrimitives'
import { useLanguage } from '@/lib/i18n'

const IUCN_LEGEND = [
  { code: 'EX', zh: '灭绝 Extinct', en: 'Extinct' },
  { code: 'CR', zh: '极危 Critically Endangered', en: 'Critically Endangered' },
  { code: 'EN', zh: '濒危 Endangered', en: 'Endangered' },
  { code: 'VU', zh: '易危 Vulnerable', en: 'Vulnerable' },
  { code: 'NT', zh: '近危 Near Threatened', en: 'Near Threatened' },
  { code: 'LC', zh: '无危 Least Concern', en: 'Least Concern' },
]

const RISK_LEGEND = [
  { zh: '高入侵风险', en: 'High invasion risk', desc_zh: '已列入中国外来入侵物种名单，扩散能力强、危害显著', desc_en: 'Listed among China\'s invasive species; rapid spread and high impact' },
  { zh: '中等入侵风险', en: 'Medium invasion risk', desc_zh: '具有较强的扩散与占据能力，需持续监测', desc_en: 'Capable of spreading and taking over; monitored' },
  { zh: '需关注', en: 'Watch list', desc_zh: '有入侵倾向或局部扩散记录', desc_en: 'Invasive tendency or local spread recorded' },
]

const SOURCES = [
  {
    zh: 'IUCN 红色名录 — 物种濒危等级评定',
    en: 'IUCN Red List — global conservation status assessments',
  },
  {
    zh: '《中国外来入侵物种名单》— 植物入侵风险标注',
    en: 'China\'s official invasive species lists — invasion-risk tagging',
  },
  {
    zh: '《国家重点保护野生动物名录》— 中国保护级别',
    en: 'China\'s key protected wildlife list — national protection levels',
  },
  {
    zh: '物种图片来自 iNaturalist 开放许可照片（CC 授权，已注明出处）',
    en: 'Species photos from iNaturalist open-license imagery (CC licensed, attributed)',
  },
]

export default function About() {
  const { lang, t } = useLanguage()

  return (
    <div className="container max-w-4xl py-24">
      <FadeIn>
        <h1 className="font-display text-4xl font-bold">{t('aboutTitle')}</h1>
        <p className="mt-4 leading-loose text-[15px] text-foreground/85">
          {lang === 'zh'
            ? 'WildAtlas（野境图鉴）是一座面向公众的野生动植物双语科普平台。我们希望把散落在名录、论文与野外观测中的信息，整理成普通人也能读懂的一页：植物告诉你它是本土居民还是入侵者、入侵风险有多高；动物告诉你它离灭绝还有多远。每个物种都配有分布地图，让「它们在哪里」一目了然。'
            : 'WildAtlas is a bilingual field guide for the public. We distil information scattered across red lists, papers and field records into pages anyone can read: for plants, whether they are native or invasive and how risky; for animals, how far they stand from extinction. Every species comes with a distribution map.'}
        </p>
      </FadeIn>

      <FadeIn>
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <ScrollText className="size-5 text-primary" />
            {t('statusLegend')}
          </h2>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap gap-2">
              {IUCN_LEGEND.map((item) => (
                <span key={item.code} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
                  <span className="font-bold">{item.code}</span> · {lang === 'zh' ? item.zh : item.en}
                </span>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-border pt-4">
              {RISK_LEGEND.map((item) => (
                <div key={item.zh} className="flex items-start gap-2 text-sm">
                  <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div>
                    <span className="font-semibold">{lang === 'zh' ? item.zh : item.en}</span>
                    <span className="text-muted-foreground"> — {lang === 'zh' ? item.desc_zh : item.desc_en}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <Leaf className="size-5 text-primary" />
            {t('dataSources')}
          </h2>
          <ul className="space-y-2.5 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed">
            {SOURCES.map((s) => (
              <li key={s.zh} className="flex items-start gap-2.5">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary" />
                {lang === 'zh' ? s.zh : s.en}
              </li>
            ))}
          </ul>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <GitBranch className="size-5 text-primary" />
            {t('techStack')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: <GitBranch className="size-4" />, zh: '前端：React 19 + Vite + Tailwind CSS + framer-motion + ECharts', en: 'Frontend: React 19 + Vite + Tailwind CSS + framer-motion + ECharts' },
              { icon: <GitBranch className="size-4" />, zh: '后端：Express + TypeScript + Zod 数据校验', en: 'Backend: Express + TypeScript + Zod validation' },
              { icon: <Database className="size-4" />, zh: '数据库：SQLite + Prisma ORM（85 个物种，可平移至 PostgreSQL）', en: 'Database: SQLite + Prisma ORM (85 species, portable to PostgreSQL)' },
              { icon: <Leaf className="size-4" />, zh: 'AI 识别：OpenAI 兼容视觉模型接口（Key 自行配置）', en: 'AI identify: OpenAI-compatible vision model (bring your own key)' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm">
                <span className="mt-0.5 text-primary">{item.icon}</span>
                {lang === 'zh' ? item.zh : item.en}
              </div>
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  )
}
