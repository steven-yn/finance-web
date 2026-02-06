import { apiClient } from "@/shared/api/api-client";
import type { ApiResponse } from "@/shared/types/api";
import type {
  NewsDto,
  NewsQueryParams,
  SearchNewsParams,
  NewsStats,
} from "../types/news";

export async function fetchNewsList(
  params: NewsQueryParams = {},
): Promise<ApiResponse<NewsDto[]>> {
  return apiClient<NewsDto[]>("/api/v1/news", {
    params,
  });
}

export async function fetchNewsDetail(newsId: string): Promise<NewsDto> {
  const response = await apiClient<NewsDto>(`/api/v1/news/${newsId}`);
  return response.data;
}

export async function searchNews(
  params: SearchNewsParams,
): Promise<ApiResponse<NewsDto[]>> {
  return apiClient<NewsDto[]>("/api/v1/news/search", {
    params,
  });
}

export async function fetchNewsStats(): Promise<NewsStats> {
  const response = await apiClient<NewsStats>("/api/v1/news/stats");
  return response.data;
}
