import type { ActivoDocumentoEstado } from "@/modules/activos/activo-documento/api/activo-documento.service"

export type DocumentoEstado = Lowercase<ActivoDocumentoEstado>

/**
 * Única fuente de verdad para la vigencia de un documento.
 * Un documento sin fecha de vencimiento es permanente, no "vigente".
 */
export function getDocumentoEstado(
  fechaVencimiento?: string | null,
  now: Date = new Date(),
): DocumentoEstado {
  if (!fechaVencimiento) return "permanente"

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const parts = fechaVencimiento.split("-")
  const expiry =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(fechaVencimiento)
  expiry.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays < 0) return "vencido"
  if (diffDays <= 30) return "por_vencer"
  return "vigente"
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDateString(dateStr?: string | null): string {
  if (!dateStr) return "No registrada"
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}
