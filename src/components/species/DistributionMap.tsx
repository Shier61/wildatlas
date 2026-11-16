import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { MapPin } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

const GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'

let geoJsonCache: unknown = null

async function loadChinaGeoJson(): Promise<unknown | null> {
  if (geoJsonCache) return geoJsonCache
  try {
    const res = await fetch(GEOJSON_URL)
    if (!res.ok) return null
    geoJsonCache = await res.json()
    return geoJsonCache
  } catch {
    return null
  }
}

// Our data stores short province names ("四川"); the GeoJSON uses full names ("四川省").
function matchesProvince(geoName: string, province: string): boolean {
  const g = geoName.replace(/\s/g, '')
  const p = province.replace(/\s/g, '')
  if (g.startsWith(p) || p.startsWith(g)) return true
  // 内蒙古 / 广西 / 西藏 / 宁夏 / 新疆 abbreviations
  return g.length > 2 && p.length >= 2 && g.slice(0, 2) === p.slice(0, 2)
}

interface Props {
  provinces: string[]
  speciesName: string
}

export function DistributionMap({ provinces, speciesName }: Props) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let disposed = false

    async function render() {
      const geoJson = await loadChinaGeoJson()
      if (disposed || !containerRef.current) return
      if (!geoJson) {
        setFailed(true)
        return
      }

      echarts.registerMap('china', geoJson as Parameters<typeof echarts.registerMap>[1])
      const chart = echarts.init(containerRef.current)
      chartRef.current = chart

      const highlight = (params: { name: string }) =>
        provinces.some((p) => matchesProvince(params.name, p)) ? 1 : 0

      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params: { name: string; value?: number }) =>
            params.value === 1
              ? `${speciesName} · ${params.name}`
              : `${params.name}`,
        },
        visualMap: {
          show: false,
          min: 0,
          max: 1,
          inRange: {
            color: ['#e7ecdb', '#35644d'],
          },
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: true,
            selectedMode: false,
            data: (geoJson as { features: { properties: { name: string } }[] }).features.map(
              (f) => ({ name: f.properties.name, value: highlight({ name: f.properties.name }) })
            ),
            itemStyle: {
              borderColor: '#ffffff',
              borderWidth: 0.6,
            },
            emphasis: {
              label: { show: true, fontSize: 11, color: '#233a2e' },
              itemStyle: {
                areaColor: '#d9a53f',
              },
            },
            label: { show: false },
          },
        ],
      })

      const resize = () => chart.resize()
      window.addEventListener('resize', resize)
      return () => window.removeEventListener('resize', resize)
    }

    const cleanup = render()
    return () => {
      disposed = true
      Promise.resolve(cleanup).then((fn) => fn?.())
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [provinces, speciesName])

  if (failed) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">{t('mapFailed')}</p>
      </div>
    )
  }

  return (
    <div>
      <div ref={containerRef} className="h-[380px] w-full" />
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-3.5 text-primary" />
        <span>{t('distributionLegend')}</span>
        <span className="ml-auto flex flex-wrap gap-1.5">
          {provinces.map((p) => (
            <span key={p} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              {p}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
