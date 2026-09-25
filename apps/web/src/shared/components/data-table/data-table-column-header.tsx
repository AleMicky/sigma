import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
  hideSortMenu?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  hideSortMenu = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80", className)}>{title}</div>
  }

  if (hideSortMenu) {
    return (
      <Button
        variant="ghost"
        size="xs"
        className={cn("-ml-2 h-6.5 data-[state=open]:bg-accent font-bold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground", className)}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-1 size-3 text-primary" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-1 size-3 text-primary" />
        ) : (
          <ArrowUpDown className="ml-1 size-3 opacity-40" />
        )}
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center space-x-1.5", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="xs"
              className="-ml-2 h-6.5 data-[state=open]:bg-accent font-bold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-foreground"
            >
              <span>{title}</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-1 size-3 text-primary" />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-1 size-3 text-primary" />
              ) : (
                <ArrowUpDown className="ml-1 size-3 opacity-40" />
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 size-3.5 text-muted-foreground/70" />
            Ascendente
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 size-3.5 text-muted-foreground/70" />
            Descendente
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="mr-2 size-3.5 text-muted-foreground/70" />
                Ocultar columna
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
