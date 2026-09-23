import { Skeleton } from "@/shared/components/ui/skeleton"
import { TableCell, TableRow } from "@/shared/components/ui/table"

type DataTableSkeletonProps = {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 5,
}: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableCell key={`skeleton-col-${rowIndex}-${colIndex}`}>
              <Skeleton className="h-5 w-full max-w-30 rounded-md" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
