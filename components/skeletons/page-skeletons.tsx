import { Skeleton } from "@/components/ui/skeleton"

interface ListPageSkeletonProps {
  count?: number
}

export function ListPageSkeleton({ count = 6 }: ListPageSkeletonProps) {
  return (
    <div className="p-4 space-y-4">
      <Skeleton data-skeleton="true" className="h-12 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} data-testid="skeleton-card">
            <Skeleton data-skeleton="true" className="h-48 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <Skeleton data-skeleton="true" className="h-8 w-1/2" />
      <Skeleton data-skeleton="true" className="h-48 w-full" />
      <Skeleton data-skeleton="true" className="h-4 w-full" />
      <Skeleton data-skeleton="true" className="h-4 w-3/4" />
      <Skeleton data-skeleton="true" className="h-4 w-1/2" />
    </div>
  )
}
