import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-7xl flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/news">뉴스 홈으로</Link>
        </Button>
      </div>
    </div>
  )
}
