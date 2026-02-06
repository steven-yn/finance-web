import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ko,
  })
}

export type NewsSource = 'finnhub' | 'sec' | 'fred' | 'rss'

export function formatNewsSource(source: NewsSource): string {
  const sourceMap: Record<NewsSource, string> = {
    finnhub: 'Finnhub',
    sec: 'SEC',
    fred: 'FRED',
    rss: 'RSS',
  }

  return sourceMap[source] ?? source
}

export type NewsCategory = 'company' | 'general' | 'earnings' | 'market'

export function formatNewsCategory(category: NewsCategory): string {
  const categoryMap: Record<NewsCategory, string> = {
    company: '기업뉴스',
    general: '일반',
    earnings: '실적',
    market: '시장',
  }

  return categoryMap[category] ?? category
}
