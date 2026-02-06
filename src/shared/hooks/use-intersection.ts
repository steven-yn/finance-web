import { useEffect, useRef, useState } from 'react'

interface UseIntersectionOptions {
  threshold?: number
  rootMargin?: string
}

export function useIntersection<T extends HTMLElement>(
  options: UseIntersectionOptions = {},
) {
  const { threshold = 0, rootMargin = '0px' } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return { ref, isIntersecting }
}
