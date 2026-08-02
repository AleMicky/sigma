import { Skeleton } from "@/shared/components/ui/skeleton"
import { cn } from "@/shared/lib/utils"

type ListSkeletonProps = {
  rows?: number
  rowClassName?: string
  className?: string
}

export function ListSkeleton({
  rows = 3,
  rowClassName = "h-12",
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-2 p-4", className)}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn("w-full", rowClassName)} />
      ))}
    </div>
  )
}
