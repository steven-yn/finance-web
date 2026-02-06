"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { InfiniteData } from "@tanstack/react-query";
import {
  useNewsInfiniteQuery,
  useNewsSearchInfiniteQuery,
} from "../api/news-queries";
import { NewsCard } from "./news-card";
import { NewsSkeleton } from "./news-skeleton";
import { useIntersection } from "@/shared/hooks/use-intersection";
import type { NewsQueryParams, NewsDto } from "../types/news";
import type { ApiResponse } from "@/shared/types/api";

interface NewsListProps {
  filters?: NewsQueryParams;
  searchQuery?: string;
}

export function NewsList({ filters = {}, searchQuery }: NewsListProps) {
  const isSearchMode = !!searchQuery;

  const listQuery = useNewsInfiniteQuery(filters, { enabled: !isSearchMode });
  const searchQueryResult = useNewsSearchInfiniteQuery(
    { q: searchQuery || "" },
    { enabled: isSearchMode },
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = isSearchMode ? searchQueryResult : listQuery;

  const { ref, isIntersecting } = useIntersection<HTMLDivElement>({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NewsSkeleton count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-destructive">
          뉴스를 불러올 수 없습니다
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "다시 시도해주세요"}
        </p>
      </div>
    );
  }

  const infiniteData = data as InfiniteData<ApiResponse<NewsDto[]>> | undefined;
  const allNewsRaw = infiniteData?.pages?.flatMap((page) => page.data) ?? [];

  // 중복 제거: newsId 기준으로 유니크한 뉴스만 유지
  const allNews = allNewsRaw.filter(
    (news, index, self) =>
      index === self.findIndex((n) => n.newsId === news.newsId),
  );

  if (allNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-6xl">📭</span>
        <p className="mt-4 text-lg font-medium">뉴스가 없습니다</p>
        <p className="mt-2 text-sm text-muted-foreground">
          다른 필터를 선택해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allNews.map((news) => (
          <NewsCard key={news.newsId} news={news} />
        ))}
      </div>

      {/* 무한스크롤 트리거 */}
      <div ref={ref} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
      </div>

      {!hasNextPage && allNews.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          모든 뉴스를 불러왔습니다
        </p>
      )}
    </div>
  );
}
