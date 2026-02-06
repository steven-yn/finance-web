'use client'

import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import {
  formatRelativeDate,
  formatNewsSource,
  formatNewsCategory,
} from '@/shared/lib/format'
import { useNewsDetailQuery } from '../api/news-queries'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface NewsDetailProps {
  newsId: string
}

const sourceColors = {
  finnhub: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  sec: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  fred: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  rss: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
}

export function NewsDetail({ newsId }: NewsDetailProps) {
  const router = useRouter()
  const { data: news, isLoading, isError, error } = useNewsDetailQuery(newsId)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-10 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <Separator />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (isError || !news) {
    return (
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-6xl">⚠️</span>
          <p className="mt-4 text-lg font-medium text-destructive">
            뉴스를 불러올 수 없습니다
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message || '다시 시도해주세요'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        className="hover:bg-accent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로가기
      </Button>

      <div className="space-y-4">
        {/* 메타 정보 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge
            variant="outline"
            className={cn('font-medium', sourceColors[news.source])}
          >
            {formatNewsSource(news.source)}
          </Badge>
          <span>·</span>
          <span>{formatNewsCategory(news.category)}</span>
          <span>·</span>
          <span>
            {format(new Date(news.publishedAt), 'yyyy.MM.dd HH:mm', {
              locale: ko,
            })}
          </span>
        </div>

        {/* 헤드라인 */}
        <h1 className="text-3xl font-bold leading-tight">{news.headline}</h1>
      </div>

      <Separator />

      {/* 요약 본문 */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-base leading-relaxed">{news.summary}</p>
      </div>

      {/* 심볼 태그 */}
      {news.symbols && news.symbols.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {news.symbols.map((symbol) => (
            <Badge key={symbol} variant="secondary">
              {symbol}
            </Badge>
          ))}
        </div>
      )}

      {/* 원문 링크 */}
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        asChild
      >
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          원문 보기
        </a>
      </Button>
    </article>
  )
}
