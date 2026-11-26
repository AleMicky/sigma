import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

import { getMethodStyle } from "../lib/permiso-method.utils"

type PermisoMethodBadgeProps = {
  method: string
  className?: string
  size?: "sm" | "default"
}

export function PermisoMethodBadge({
  method,
  className,
  size = "default",
}: PermisoMethodBadgeProps) {
  const style = getMethodStyle(method)

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono font-bold uppercase transition-colors shrink-0 tracking-wider",
        size === "sm"
          ? "px-1.5 py-0 text-[9.5px] h-4 rounded"
          : "px-2 py-0.5 text-[11px] rounded-md",
        style,
        className,
      )}
    >
      {method}
    </Badge>
  )
}
