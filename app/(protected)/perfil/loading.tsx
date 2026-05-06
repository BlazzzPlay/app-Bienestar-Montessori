import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="h-[120px] w-[120px] rounded-2xl" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  )
}
