import { http, HttpResponse } from 'msw'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export const handlers = [
  http.get(`${API_URL}/api/v1/news`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
      meta: {
        total: 0,
        limit: 20,
        offset: 0,
      },
    })
  }),
]
