import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}
