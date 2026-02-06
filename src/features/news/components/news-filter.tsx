'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatNewsCategory, formatNewsSource } from '@/shared/lib/format'
import type { NewsSource, NewsCategory } from '@/shared/lib/format'
import { useNewsFilters } from '../hooks/use-news-filters'

const categories: Array<{ value: NewsCategory | ''; label: string }> = [
  { value: '', label: '전체' },
  { value: 'company', label: '기업뉴스' },
  { value: 'general', label: '일반' },
  { value: 'earnings', label: '실적' },
  { value: 'market', label: '시장' },
]

const sources: Array<{ value: NewsSource | ''; label: string }> = [
  { value: '', label: '전체' },
  { value: 'finnhub', label: 'Finnhub' },
  { value: 'sec', label: 'SEC' },
  { value: 'fred', label: 'FRED' },
  { value: 'rss', label: 'RSS' },
]

export function NewsFilter() {
  const { category, source, setCategory, setSource, isSearchMode } =
    useNewsFilters()

  if (isSearchMode) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* 카테고리 탭 */}
      <Tabs
        value={category}
        onValueChange={(value) => setCategory(value as NewsCategory | '')}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid w-full grid-cols-5 sm:w-auto">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 소스 드롭다운 */}
      <Select
        value={source}
        onValueChange={(value) => setSource(value as NewsSource | '')}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="소스 선택" />
        </SelectTrigger>
        <SelectContent>
          {sources.map((src) => (
            <SelectItem key={src.value} value={src.value}>
              {src.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
