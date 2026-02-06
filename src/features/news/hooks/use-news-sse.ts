'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { config } from '@/shared/config/env'
import type { NewsSource, NewsCategory } from '@/shared/lib/format'

interface UseNewsSseOptions {
  source?: NewsSource | ''
  category?: NewsCategory | ''
  enabled?: boolean
}

interface SseState {
  isConnected: boolean
  newCount: number
  error: string | null
  retryCount: number
}

const MAX_RETRIES = 10
const INITIAL_RETRY_DELAY = 1000 // 1초
const MAX_RETRY_DELAY = 30000 // 30초

export function useNewsSse(options: UseNewsSseOptions = {}) {
  const { source, category, enabled = true } = options
  const [state, setState] = useState<SseState>({
    isConnected: false,
    newCount: 0,
    error: null,
    retryCount: 0,
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!enabled || !mountedRef.current) return

    disconnect()

    const params = new URLSearchParams()
    if (source) params.append('source', source)
    if (category) params.append('category', category)
    const queryString = params.toString()
    const url = `${config.apiUrl}/api/v1/news/stream${queryString ? `?${queryString}` : ''}`

    try {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        if (!mountedRef.current) return
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
          retryCount: 0,
        }))
      }

      eventSource.onmessage = (event) => {
        if (!mountedRef.current) return
        try {
          JSON.parse(event.data)
          setState((prev) => ({
            ...prev,
            newCount: prev.newCount + 1,
          }))
        } catch {
          setState((prev) => ({
            ...prev,
            error: 'SSE 메시지 파싱 실패',
          }))
        }
      }

      eventSource.onerror = () => {
        if (!mountedRef.current) return

        setState((prev) => {
          const newRetryCount = prev.retryCount + 1

          if (newRetryCount >= MAX_RETRIES) {
            disconnect()
            return {
              ...prev,
              isConnected: false,
              error: '연결 재시도 횟수를 초과했습니다',
              retryCount: newRetryCount,
            }
          }

          // 지수 백오프 계산
          const delay = Math.min(
            INITIAL_RETRY_DELAY * Math.pow(2, newRetryCount - 1),
            MAX_RETRY_DELAY,
          )

          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect()
            }
          }, delay)

          return {
            ...prev,
            isConnected: false,
            error: '연결 중...',
            retryCount: newRetryCount,
          }
        })
      }
    } catch (error) {
      if (!mountedRef.current) return
      setState((prev) => ({
        ...prev,
        isConnected: false,
        error: '연결 실패',
      }))
    }
  }, [enabled, source, category, disconnect])

  const resetCount = useCallback(() => {
    setState((prev) => ({ ...prev, newCount: 0 }))
  }, [])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      disconnect()
    }
  }, [connect, disconnect])

  return {
    ...state,
    resetCount,
    reconnect: connect,
  }
}
