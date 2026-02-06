import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'

interface NewsSkeletonProps {
  count?: number
  className?: string
}

export function NewsSkeleton({ count = 1, className }: NewsSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className={cn(className)}>
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-14" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
