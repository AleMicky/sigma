import { formatDateTime } from "@/shared/utils/date.utils"
import { cn } from "@/shared/lib/utils"

export type AuditableFields = {
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

type AuditInfoProps = {
  data: AuditableFields
  className?: string
  compact?: boolean
}

export function AuditInfo({
  data,
  className,
  compact = false,
}: AuditInfoProps) {
  const createdLabel = [
    formatDateTime(data.createdAt),
    data.createdBy ? `por ${data.createdBy}` : null,
  ]
    .filter(Boolean)
    .join(" ")

  const updatedAt = data.updatedAt ?? data.createdAt
  const updatedBy = data.updatedBy ?? data.createdBy
  const updatedLabel = [
    formatDateTime(updatedAt),
    updatedBy ? `por ${updatedBy}` : null,
  ]
    .filter(Boolean)
    .join(" ")

  if (compact) {
    return (
      <p className={cn("truncate text-[11px] text-muted-foreground", className)}>
        Actualizado {updatedLabel}
      </p>
    )
  }

  return (
    <dl
      className={cn(
        "grid gap-1 text-xs text-muted-foreground sm:grid-cols-2",
        className,
      )}
    >
      <div className="min-w-0">
        <dt className="font-medium tracking-wide uppercase">Creado</dt>
        <dd className="truncate">{createdLabel}</dd>
      </div>
      <div className="min-w-0">
        <dt className="font-medium tracking-wide uppercase">Actualizado</dt>
        <dd className="truncate">{updatedLabel}</dd>
      </div>
    </dl>
  )
}
