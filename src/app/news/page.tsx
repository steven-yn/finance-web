"use client";

import { Suspense } from "react";
import { NewsList } from "@/features/news/components/news-list";
import { NewsSearch } from "@/features/news/components/news-search";
import { NewsFilter } from "@/features/news/components/news-filter";
import { NewsLiveBadge } from "@/features/news/components/news-live-badge";
import { NewsStats } from "@/features/news/components/news-stats";
import { useNewsFilters } from "@/features/news/hooks/use-news-filters";
import { NewsSkeleton } from "@/features/news/components/news-skeleton";

function NewsContent() {
  const { source, category, searchQuery, isSearchMode } = useNewsFilters();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">뉴스</h1>
          <p className="mt-2 text-muted-foreground">
            미국 주식과 코인 관련 최신 뉴스를 확인하세요
          </p>
        </div>

        <NewsSearch />

        {!isSearchMode && <NewsStats />}

        <NewsFilter />

        <NewsLiveBadge
          source={source}
          category={category}
          enabled={!isSearchMode}
        />
      </div>

      <NewsList
        filters={{
          source: source || undefined,
          category: category || undefined,
        }}
        searchQuery={searchQuery}
      />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold">뉴스</h1>
            <p className="mt-2 text-muted-foreground">
              미국 주식과 코인 관련 최신 뉴스를 확인하세요
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NewsSkeleton count={6} />
          </div>
        </div>
      }
    >
      <NewsContent />
    </Suspense>
  );
}
