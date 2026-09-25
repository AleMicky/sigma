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
  const widths = ["max-w-36", "max-w-24", "max-w-44", "max-w-28", "max-w-20", "max-w-32"]

  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableCell key={`skeleton-col-${rowIndex}-${colIndex}`} className="py-2.5">
              <Skeleton
                className={`h-4.5 w-full ${widths[colIndex % widths.length]} rounded-md`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
