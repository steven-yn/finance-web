import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import {
  fetchNewsList,
  fetchNewsDetail,
  searchNews,
  fetchNewsStats,
} from "./news-api";
import type {
  NewsDto,
  NewsQueryParams,
  SearchNewsParams,
  NewsStats,
} from "../types/news";
import type { ApiResponse } from "@/shared/types/api";

export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (filters: NewsQueryParams) => [...newsKeys.lists(), filters] as const,
  searches: () => [...newsKeys.all, "search"] as const,
  search: (params: SearchNewsParams) =>
    [...newsKeys.searches(), params] as const,
  details: () => [...newsKeys.all, "detail"] as const,
  detail: (newsId: string) => [...newsKeys.details(), newsId] as const,
  stats: () => [...newsKeys.all, "stats"] as const,
};

export function useNewsInfiniteQuery(
  params: NewsQueryParams = {},
  options?: Partial<UseInfiniteQueryOptions<ApiResponse<NewsDto[]>, Error>>,
) {
  return useInfiniteQuery({
    queryKey: newsKeys.list(params),
    queryFn: ({ pageParam = 0 }) =>
      fetchNewsList({
        ...params,
        offset: pageParam as number,
        limit: params.limit ?? 20,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { offset, limit, total } = lastPage.meta;
      const nextOffset = offset + limit;
      return nextOffset < total ? nextOffset : undefined;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useNewsSearchInfiniteQuery(
  params: SearchNewsParams,
  options?: Partial<UseInfiniteQueryOptions<ApiResponse<NewsDto[]>, Error>>,
) {
  return useInfiniteQuery({
    queryKey: newsKeys.search(params),
    queryFn: ({ pageParam = 0 }) =>
      searchNews({
        ...params,
        offset: pageParam as number,
        limit: params.limit ?? 20,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { offset, limit, total } = lastPage.meta;
      const nextOffset = offset + limit;
      return nextOffset < total ? nextOffset : undefined;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!params.q,
    ...options,
  });
}

export function useNewsDetailQuery(
  newsId: string,
  options?: Partial<UseQueryOptions<NewsDto, Error>>,
) {
  return useQuery({
    queryKey: newsKeys.detail(newsId),
    queryFn: () => fetchNewsDetail(newsId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}

export function useNewsStatsQuery(
  options?: Partial<UseQueryOptions<NewsStats, Error>>,
) {
  return useQuery({
    queryKey: newsKeys.stats(),
    queryFn: fetchNewsStats,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
}
