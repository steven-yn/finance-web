'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { useNewsFilters } from '../hooks/use-news-filters'

export function NewsSearch() {
  const { searchQuery, setSearch, clearSearch } = useNewsFilters()
  const [inputValue, setInputValue] = useState(searchQuery)
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedValue !== searchQuery) {
      if (debouncedValue) {
        setSearch(debouncedValue)
      } else {
        clearSearch()
      }
    }
  }, [debouncedValue, searchQuery, setSearch, clearSearch])

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  const handleClear = () => {
    setInputValue('')
    clearSearch()
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="뉴스 검색..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {inputValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">검색 지우기</span>
        </Button>
      )}
    </div>
  )
}
