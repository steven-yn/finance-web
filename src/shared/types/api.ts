export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    total: number
    limit: number
    offset: number
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}
