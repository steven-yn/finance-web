import { config } from "@/shared/config/env";
import { ApiClientError, type ApiResponse } from "@/shared/types/api";

interface FetchOptions extends RequestInit {
  params?:
    | Record<string, string | number | boolean | undefined>
    | { [key: string]: unknown };
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  let url = `${config.apiUrl}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiClientError(
        errorData.message ?? `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code,
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new ApiClientError(
        data.message ?? "API 요청이 실패했습니다",
        response.status,
        data.code,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiClientError("네트워크 연결을 확인해주세요");
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
    );
  }
}
