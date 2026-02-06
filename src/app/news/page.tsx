import { NewsList } from "@/features/news/components/news-list";

export default function NewsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">뉴스</h1>
        <p className="mt-2 text-muted-foreground">
          미국 주식과 코인 관련 최신 뉴스를 확인하세요
        </p>
      </div>

      <NewsList />
    </div>
  );
}
