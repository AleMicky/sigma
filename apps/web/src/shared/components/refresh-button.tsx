import * as React from "react"
import { useQueryClient, type QueryKey } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

import { Button, type buttonVariants } from "@/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { cn } from "@/shared/lib/utils"
import type { VariantProps } from "class-variance-authority"

export interface QueryLike {
  isFetching?: boolean
  refetch?: () => unknown
}

export interface RefreshButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /**
   * Manual refresh callback function (e.g. `() => query.refetch()`)
   */
  onRefresh?: () => void | Promise<unknown>
  /**
   * Explicit refreshing / fetching indicator
   */
  isRefreshing?: boolean
  /**
   * Specific query key to invalidate with useQueryClient
   */
  queryKey?: QueryKey
  /**
   * Pass one or multiple queries to automatically refetch and detect isFetching state
   */
  queries?: QueryLike | QueryLike[]
  /**
   * Tooltip text to show on hover (defaults to "Actualizar datos")
   */
  tooltip?: string
  /**
   * Button variant
   */
  variant?: VariantProps<typeof buttonVariants>["variant"]
  /**
   * Button size
   */
  size?: VariantProps<typeof buttonVariants>["size"]
  /**
   * Text label next to the refresh icon (if any)
   */
  label?: string
  /**
   * Responsive control to only show label on md/lg screens
   */
  responsiveLabel?: boolean
  /**
   * Icon classname
   */
  iconClassName?: string
}

export function RefreshButton({
  onRefresh,
  isRefreshing: explicitIsRefreshing,
  queryKey,
  queries,
  tooltip = "Actualizar datos",
  variant = "outline",
  size = "sm",
  label,
  responsiveLabel = true,
  iconClassName,
  className,
  disabled,
  ...props
}: RefreshButtonProps) {
  const queryClient = useQueryClient()
  const [internalLoading, setInternalLoading] = React.useState(false)

  const queriesList = React.useMemo(() => {
    if (!queries) return []
    return Array.isArray(queries) ? queries : [queries]
  }, [queries])

  const anyQueryFetching = queriesList.some((q) => Boolean(q.isFetching))
  const isRefreshing =
    explicitIsRefreshing !== undefined
      ? explicitIsRefreshing
      : anyQueryFetching || internalLoading

  const handleRefresh = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (isRefreshing || disabled) return

    try {
      setInternalLoading(true)

      if (onRefresh) {
        await Promise.resolve(onRefresh())
      }

      if (queriesList.length > 0) {
        await Promise.all(
          queriesList.map((q) => (q.refetch ? Promise.resolve(q.refetch()) : Promise.resolve())),
        )
      }

      if (queryKey) {
        await queryClient.invalidateQueries({ queryKey })
      }
    } finally {
      setInternalLoading(false)
    }
  }

  const buttonElement = (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={disabled || isRefreshing}
      aria-label={label || tooltip}
      className={cn("shrink-0 gap-1.5 transition-colors", className)}
      {...props}
    >
      <RefreshCw
        className={cn(
          "size-3.5 shrink-0 transition-transform",
          isRefreshing && "animate-spin text-primary",
          iconClassName,
        )}
      />
      {label ? (
        <span
          className={cn(
            responsiveLabel ? "hidden sm:inline-block" : "inline-block",
          )}
        >
          {label}
        </span>
      ) : null}
    </Button>
  )

  if (!tooltip) {
    return buttonElement
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={buttonElement} />
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
