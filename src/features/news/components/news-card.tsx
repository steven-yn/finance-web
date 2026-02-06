import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import {
  formatRelativeDate,
  formatNewsSource,
  formatNewsCategory,
} from '@/shared/lib/format'
import type { NewsDto } from '../types/news'

interface NewsCardProps {
  news: NewsDto
  className?: string
}

const sourceColors = {
  finnhub: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  sec: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  fred: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  rss: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
}

export function NewsCard({ news, className }: NewsCardProps) {
  return (
    <Link href={`/news/${news.newsId}`}>
      <Card
        className={cn(
          'group transition-all duration-200 hover:-translate-y-1 hover:shadow-md',
          className,
        )}
      >
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('font-medium', sourceColors[news.source])}
              >
                {formatNewsSource(news.source)}
              </Badge>
              <span>{formatNewsCategory(news.category)}</span>
            </div>
            <span className="whitespace-nowrap">
              {formatRelativeDate(news.publishedAt)}
            </span>
          </div>

          <h3 className="line-clamp-2 text-lg font-medium leading-snug transition-colors group-hover:text-primary">
            {news.headline}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {news.summary}
          </p>

          {news.symbols && news.symbols.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {news.symbols.slice(0, 5).map((symbol) => (
                <Badge
                  key={symbol}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {symbol}
                </Badge>
              ))}
              {news.symbols.length > 5 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{news.symbols.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
