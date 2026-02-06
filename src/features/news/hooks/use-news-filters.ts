'use client'

import { useQueryStates, parseAsString } from 'nuqs'
import type { NewsSource, NewsCategory } from '@/shared/lib/format'

export function useNewsFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      source: parseAsString.withDefault(''),
      category: parseAsString.withDefault(''),
      q: parseAsString.withDefault(''),
    },
    {
      history: 'push',
      shallow: false,
    },
  )

  const setSource = (source: NewsSource | '') => {
    setFilters({ source })
  }

  const setCategory = (category: NewsCategory | '') => {
    setFilters({ category })
  }

  const setSearch = (q: string) => {
    setFilters({ q, source: '', category: '' })
  }

  const clearSearch = () => {
    setFilters({ q: '' })
  }

  const clearAllFilters = () => {
    setFilters({ source: '', category: '', q: '' })
  }

  return {
    source: filters.source as NewsSource | '',
    category: filters.category as NewsCategory | '',
    searchQuery: filters.q,
    setSource,
    setCategory,
    setSearch,
    clearSearch,
    clearAllFilters,
    isSearchMode: !!filters.q,
  }
}
