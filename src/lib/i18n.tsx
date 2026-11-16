import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Language = 'zh' | 'en'

const STORAGE_KEY = 'wildatlas-language'

const strings = {
  // nav
  home: { zh: '首页', en: 'Home' },
  plants: { zh: '植物图鉴', en: 'Plants' },
  animals: { zh: '动物图鉴', en: 'Animals' },
  identify: { zh: 'AI 识别', en: 'AI Identify' },
  about: { zh: '关于', en: 'About' },
  brand: { zh: '野境图鉴', en: 'WildAtlas' },
  brandTagline: { zh: '野生动植物科普平台', en: 'Biodiversity Atlas' },

  // hero
  heroTitle: { zh: '读懂山野的名字', en: 'Read the Names of the Wild' },
  heroSubtitle: {
    zh: '一座面向公众的野生动植物双语图鉴：浏览物种的保护等级与入侵风险，看懂它们脚下的大地。',
    en: 'A bilingual field guide for everyone: browse conservation status and invasion risk, and see the ground every species stands on.',
  },
  heroCta: { zh: '开始探索', en: 'Start Exploring' },
  heroCtaAi: { zh: '拍照识物种', en: 'Identify a Photo' },

  // stats
  statSpecies: { zh: '收录物种', en: 'Species' },
  statPlants: { zh: '植物', en: 'Plants' },
  statAnimals: { zh: '动物', en: 'Animals' },
  statThreatened: { zh: '受威胁物种', en: 'Threatened' },
  statInvasive: { zh: '外来入侵', en: 'Invasive' },

  // index
  indexTitle: { zh: '物种索引', en: 'Species Index' },
  filters: { zh: '筛选', en: 'Filters' },
  category: { zh: '类群', en: 'Category' },
  allCategory: { zh: '全部类群', en: 'All' },
  status: { zh: '濒危等级', en: 'IUCN Status' },
  allStatus: { zh: '全部等级', en: 'All' },
  origin: { zh: '生态属性', en: 'Origin' },
  allOrigin: { zh: '全部', en: 'All' },
  native: { zh: '本土原生', en: 'Native' },
  invasive: { zh: '外来入侵', en: 'Invasive' },
  searchPlaceholder: { zh: '搜索中文名 / 英文名 / 学名…', en: 'Search name / scientific name…' },
  sortName: { zh: '按名称', en: 'By name' },
  sortStatus: { zh: '按濒危程度', en: 'By status' },
  sortRisk: { zh: '按入侵风险', en: 'By risk' },
  resultCount: { zh: '个物种', en: 'species' },
  prevPage: { zh: '上一页', en: 'Prev' },
  nextPage: { zh: '下一页', en: 'Next' },
  noResult: { zh: '没有匹配的物种，试试放宽筛选条件。', en: 'No species match. Try loosening the filters.' },
  resetFilters: { zh: '重置筛选', en: 'Reset filters' },

  // detail
  backToIndex: { zh: '返回索引', en: 'Back to index' },
  iucnLabel: { zh: 'IUCN 濒危等级', en: 'IUCN Red List' },
  protectionLabel: { zh: '保护级别', en: 'Protection' },
  invasiveRiskLabel: { zh: '入侵风险', en: 'Invasion Risk' },
  originLabel: { zh: '生态属性', en: 'Origin' },
  familyLabel: { zh: '分类科属', en: 'Family' },
  habitatLabel: { zh: '栖息环境', en: 'Habitat' },
  rangeLabel: { zh: '分布范围', en: 'Distribution' },
  threatLabel: { zh: '主要威胁', en: 'Main threats' },
  similarLabel: { zh: '同类群物种', en: 'Related species' },
  distributionLegend: { zh: '在中国境内的分布省份', en: 'Provinces of occurrence in China' },
  mapLoading: { zh: '地图加载中…', en: 'Loading map…' },
  mapFailed: { zh: '地图数据暂不可用', en: 'Map unavailable' },
  viewDetail: { zh: '查看详情', en: 'View detail' },

  // identify
  identifyTitle: { zh: 'AI 物种识别', en: 'AI Species Identification' },
  identifyDesc: {
    zh: '上传一张野外拍摄的照片，AI 将给出最可能的物种候选及其置信度。',
    en: 'Upload a field photo and the AI will return the most likely species candidates with confidence scores.',
  },
  dropHere: { zh: '拖拽照片到这里，或点击选择', en: 'Drag a photo here, or click to choose' },
  formats: { zh: '支持 JPG / PNG，单张不超过 8MB', en: 'JPG / PNG up to 8MB' },
  identifying: { zh: '识别中，请稍候…', en: 'Identifying…' },
  demoNotice: {
    zh: '当前为演示模式：后端未配置 AI_API_KEY，返回的是示例结果。在 backend/.env 中填入视觉大模型的 Key 即可启用真实识别。',
    en: 'Demo mode: AI_API_KEY is not configured, results are samples. Set a vision model key in backend/.env to enable real identification.',
  },
  candidates: { zh: '识别候选', en: 'Candidates' },
  confidence: { zh: '置信度', en: 'Confidence' },
  reIdentify: { zh: '换一张照片', en: 'Try another photo' },

  // about
  aboutTitle: { zh: '关于本项目', en: 'About' },
  statusLegend: { zh: '濒危等级图例', en: 'Status Legend' },
  dataSources: { zh: '数据来源', en: 'Data Sources' },
  techStack: { zh: '技术栈', en: 'Tech Stack' },

  // footer
  footerNote: { zh: 'WildAtlas · 野生动植物科普平台', en: 'WildAtlas · A bilingual biodiversity atlas' },

  // misc
  loading: { zh: '加载中…', en: 'Loading…' },
  notFound: { zh: '页面不存在', en: 'Page not found' },
  backHome: { zh: '回到首页', en: 'Back home' },
  errServer: { zh: '服务暂时不可用，请稍后再试', en: 'Service unavailable, please retry' },
} as const

export type StringKey = keyof typeof strings

export function t(key: StringKey, lang: Language): string {
  return strings[key][lang]
}

interface LanguageContextValue {
  lang: Language
  setLang: (l: Language) => void
  t: (key: StringKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    return saved === 'en' ? 'en' : 'zh'
  })

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    window.localStorage.setItem(STORAGE_KEY, l)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const value: LanguageContextValue = {
    lang,
    setLang,
    t: (key) => t(key, lang),
  }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

// ---- shared labels ----

export const IUCN_LABELS: Record<string, { zh: string; en: string }> = {
  EX: { zh: '灭绝', en: 'Extinct' },
  CR: { zh: '极危', en: 'Critically Endangered' },
  EN: { zh: '濒危', en: 'Endangered' },
  VU: { zh: '易危', en: 'Vulnerable' },
  NT: { zh: '近危', en: 'Near Threatened' },
  LC: { zh: '无危', en: 'Least Concern' },
  DD: { zh: '数据缺乏', en: 'Data Deficient' },
}

export const RISK_LABELS: Record<string, { zh: string; en: string }> = {
  high: { zh: '高入侵风险', en: 'High invasion risk' },
  medium: { zh: '中等入侵风险', en: 'Medium invasion risk' },
  watch: { zh: '需关注', en: 'Watch list' },
}

export const GROUP_LABELS: Record<string, { zh: string; en: string }> = {
  tree: { zh: '乔木', en: 'Trees' },
  shrub: { zh: '灌木', en: 'Shrubs' },
  herb: { zh: '草本', en: 'Herbs' },
  fern: { zh: '蕨类', en: 'Ferns' },
  aquatic: { zh: '水生植物', en: 'Aquatic plants' },
  mammal: { zh: '兽类', en: 'Mammals' },
  bird: { zh: '鸟类', en: 'Birds' },
  reptile: { zh: '爬行类', en: 'Reptiles' },
  amphibian: { zh: '两栖类', en: 'Amphibians' },
  fish: { zh: '鱼类', en: 'Fishes' },
  insect: { zh: '昆虫', en: 'Insects' },
  other: { zh: '其他', en: 'Others' },
}
