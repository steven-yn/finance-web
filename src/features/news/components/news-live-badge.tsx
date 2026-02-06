'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useNewsSse } from '../hooks/use-news-sse'
import { newsKeys } from '../api/news-queries'
import type { NewsSource, NewsCategory } from '@/shared/lib/format'

interface NewsLiveBadgeProps {
  source?: NewsSource | ''
  category?: NewsCategory | ''
  enabled?: boolean
}

export function NewsLiveBadge({
  source,
  category,
  enabled = true,
}: NewsLiveBadgeProps) {
  const queryClient = useQueryClient()
  const { isConnected, newCount, error, resetCount } = useNewsSse({
    source,
    category,
    enabled,
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: newsKeys.lists() })
    resetCount()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!enabled || newCount === 0) {
    return null
  }

  return (
    <Button
      variant="outline"
      className={cn(
        'w-full animate-in slide-in-from-top-2 fade-in',
        'border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20',
        'text-blue-600 dark:text-blue-400',
      )}
      onClick={handleRefresh}
    >
      <span
        className={cn(
          'mr-2 h-2 w-2 rounded-full',
          isConnected ? 'bg-red-500 animate-pulse' : 'bg-gray-500',
        )}
      />
      {isConnected ? '🔴 Live' : '⚫'} · {newCount}개의 새 뉴스 · 클릭하여 보기
    </Button>
  )
}
