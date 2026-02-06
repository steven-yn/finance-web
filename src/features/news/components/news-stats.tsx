'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNewsStatsQuery } from '../api/news-queries'
import { formatNewsSource } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

const sourceColors = {
  finnhub: 'text-blue-500',
  sec: 'text-purple-500',
  fred: 'text-amber-500',
  rss: 'text-cyan-500',
}

const sourceIcons = {
  finnhub: '🔵',
  sec: '🟣',
  fred: '🟡',
  rss: '🔷',
}

export function NewsStats() {
  const { data: stats, isLoading, isError } = useNewsStatsQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <Skeleton className="mx-auto h-6 w-12" />
              <Skeleton className="mx-auto mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !stats) {
    return null
  }

  const statItems = [
    {
      label: '📰 전체',
      value: stats.total,
      color: 'text-foreground',
    },
    ...stats.bySource.slice(0, 3).map((item) => ({
      label: `${sourceIcons[item.source]} ${formatNewsSource(item.source)}`,
      value: item.count,
      color: sourceColors[item.source],
    })),
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statItems.map((item, index) => (
        <Card
          key={index}
          className="cursor-default transition-colors hover:bg-accent"
        >
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {item.label}
            </p>
            <p
              className={cn(
                'mt-2 text-2xl font-semibold tabular-nums',
                item.color,
              )}
            >
              {item.value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
