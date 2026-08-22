import { formatDateTime } from "@/shared/utils/date.utils"
import { cn } from "@/shared/lib/utils"
import type { AuditableFields } from "@/shared/types/audit.types"

type AuditInfoProps = {
  data: AuditableFields | { auditoria?: AuditableFields | null; createdAt?: string; updatedAt?: string | null; createdBy?: string | null; updatedBy?: string | null }
  className?: string
  compact?: boolean
}

export function AuditInfo({
  data,
  className,
  compact = false,
}: AuditInfoProps) {
  const audit = "auditoria" in data && data.auditoria ? data.auditoria : (data as AuditableFields)
  const createdAt = audit.createdAt ?? ""
  const updatedAt = audit.updatedAt ?? audit.createdAt ?? ""
  const createdBy = audit.createdBy ?? null
  const updatedBy = audit.updatedBy ?? audit.createdBy ?? null

  const createdLabel = [
    formatDateTime(createdAt),
    createdBy ? `por ${createdBy}` : null,
  ]
    .filter(Boolean)
    .join(" ")

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
