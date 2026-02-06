'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <span className="text-6xl">⚠️</span>
          <h2 className="mt-4 text-2xl font-semibold">
            문제가 발생했습니다
          </h2>
          <p className="text-muted-foreground">
            {error.message || '알 수 없는 오류가 발생했습니다'}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg">
            다시 시도
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="/news">뉴스 홈으로</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
