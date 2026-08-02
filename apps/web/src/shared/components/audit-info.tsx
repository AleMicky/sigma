import { formatDateTime } from "@/shared/utils/date.utils"
import { cn } from "@/shared/lib/utils"
import type { AuditableFields } from "@/shared/types/audit.types"

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
        "grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 sm:gap-1",
        className,
      )}
    >
      <div className="min-w-0">
        <dt className="font-medium tracking-wide uppercase">Creado</dt>
        <dd className="break-words sm:truncate">{createdLabel}</dd>
      </div>
      <div className="min-w-0">
        <dt className="font-medium tracking-wide uppercase">Actualizado</dt>
        <dd className="break-words sm:truncate">{updatedLabel}</dd>
      </div>
    </dl>
  )
}
