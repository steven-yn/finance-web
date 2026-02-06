import type { NewsSource, NewsCategory } from '@/shared/lib/format'

export interface NewsDto {
  newsId: string
  headline: string
  summary: string
  source: NewsSource
  category: NewsCategory
  url: string
  publishedAt: string
  symbols?: string[]
}

export interface NewsQueryParams {
  limit?: number
  offset?: number
  source?: NewsSource
  category?: NewsCategory
  [key: string]: string | number | boolean | undefined
}

export interface SearchNewsParams {
  q: string
  limit?: number
  offset?: number
  [key: string]: string | number | boolean | undefined
}

export interface NewsStats {
  total: number
  bySource: {
    source: NewsSource
    count: number
  }[]
  byCategory: {
    category: NewsCategory
    count: number
  }[]
}
