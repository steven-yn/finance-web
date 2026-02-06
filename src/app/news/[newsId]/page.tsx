import { NewsDetail } from '@/features/news/components/news-detail'

interface NewsDetailPageProps {
  params: Promise<{ newsId: string }>
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { newsId } = await params

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <NewsDetail newsId={newsId} />
    </div>
  )
}
