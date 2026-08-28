import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

type PermisoMethodBadgeProps = {
  method: string
  className?: string
  size?: "sm" | "default"
}

export function getMethodStyle(method: string): string {
  const m = method.toUpperCase()
  switch (m) {
    case "GET":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/15"
    case "POST":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15"
    case "PUT":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/15"
    case "DELETE":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/15"
    case "PATCH":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/15"
    case "OPTIONS":
    case "HEAD":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
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
