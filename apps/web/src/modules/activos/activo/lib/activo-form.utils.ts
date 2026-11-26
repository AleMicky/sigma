import { isApiError } from "@/shared/api"
import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import {
  replaceActivoAtributos,
  type ActivoAtributoValor,
  type ReplaceActivoAtributosPayload,
} from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"

import type { Activo, ActivoPayload } from "../api/activo.service"
import type { ActivoDto } from "../schemas/activo.schema"

/** Normaliza el formulario y preserva el flag `activo` del registro editado. */
export function buildActivoPayload(
  value: ActivoDto,
  activo?: Activo | null,
): ActivoPayload {
  return {
    codigo: value.codigo.trim(),
    codigoAlternativo: value.codigoAlternativo.trim() || null,
    nombre: value.nombre.trim(),
    descripcion: value.descripcion.trim() || null,
    tipoActivoId: value.tipoActivoId,
    ubicacionId: value.ubicacionId?.trim() || null,
    estadoOperativoId: value.estadoOperativoId?.trim() || null,
    fechaAdquisicion: value.fechaAdquisicion || null,
    activo: activo?.activo ?? true,
  }
}

/**
 * Decide si el guardado debe crear o actualizar. Un id ya persistido (por
 * ejemplo, cuando falló la subida de imagen o de atributos) impide crear un
 * segundo activo al reintentar.
 */
export function resolveActivoSaveTarget({
  isEditing,
  activoId,
  savedId,
}: {
  isEditing: boolean
  activoId?: string
  savedId?: string | null
}): { mode: "create" } | { mode: "update"; id: string } {
  const id = savedId ?? (isEditing ? activoId : undefined)
  return id ? { mode: "update", id } : { mode: "create" }
}

export function validateAtributos(
  atributos: ActivoAtributo[],
  valores: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const atributo of atributos) {
    if (!atributo.requerido) continue
    const value = valores[atributo.id]?.trim() ?? ""
    if (!value || value === "[]") {
      errors[atributo.id] = `El atributo "${atributo.etiqueta}" es obligatorio`
    }
  }

  return errors
}

/** Construye el payload bulk que reemplaza todos los valores del activo. */
export function buildReplaceAtributosPayload(
  atributos: ActivoAtributo[],
  valores: Record<string, string>,
  existentes?: Map<string, ActivoAtributoValor>,
): ReplaceActivoAtributosPayload {
  const items = atributos.map((atributo) => ({
    atributoId: atributo.id,
    valor: valores[atributo.id]?.trim() || null,
  }))

  // Los atributos no visibles no se editan en el formulario, pero conservan su valor.
  for (const [atributoId, existente] of existentes ?? []) {
    if (items.some((item) => item.atributoId === atributoId)) continue
    items.push({ atributoId, valor: existente.valor ?? null })
  }

  return { valores: items }
}

/** Compatibilidad con las vistas de detalle: delega en el endpoint bulk. */
export async function syncAtributoValores({
  activoId,
  atributos,
  valores,
  existentes,
}: {
  activoId: string
  atributos: ActivoAtributo[]
  valores: Record<string, string>
  existentes: Map<string, ActivoAtributoValor>
}) {
  await replaceActivoAtributos(
    activoId,
    buildReplaceAtributosPayload(atributos, valores, existentes),
  )
}

/** Traduce los `validationErrors` de la API (422) a errores por campo visible. */
export function mapAtributoValidationErrors(
  error: unknown,
  atributos: ActivoAtributo[],
): Record<string, string> {
  if (!isApiError(error) || error.status !== 422) return {}

  const ids = new Set(atributos.map((atributo) => atributo.id))
  const errors: Record<string, string> = {}

  for (const validation of error.validationErrors) {
    const field = validation.field
      .replace(/^valores\[\d+\]\./, "")
      .replace(/\.(atributoId|valor)$/, "")
    const rejected =
      typeof validation.rejectedValue === "string" &&
      ids.has(validation.rejectedValue)
        ? validation.rejectedValue
        : undefined
    const atributoId = rejected ?? (ids.has(field) ? field : undefined)

    if (atributoId) {
      errors[atributoId] = validation.messages[0] ?? "Valor inválido"
    }
  }

  // La API de atributos reporta estos 422 como BusinessException con el
  // código del atributo en el mensaje, no como `validationErrors`.
  if (error.code === "ACTIVO_ATRIBUTO_VALOR_REQUIRED") {
    const codigo = error.message.match(/'([^']+)'/)?.[1]
    const atributo = atributos.find((item) => item.codigo === codigo)
    if (atributo) errors[atributo.id] = error.message
  } else if (error.code === "ATRIBUTOS_REQUERIDOS_FALTANTES") {
    const codigos = error.message
      .split(":")
      .slice(1)
      .join(":")
      .split(",")
      .map((codigo) => codigo.trim())
    for (const atributo of atributos) {
      if (codigos.includes(atributo.codigo)) {
        errors[atributo.id] = "Este atributo es obligatorio"
      }
    }
  }

  return errors
}

export function formatAtributoValor(
  atributo: ActivoAtributo,
  rawValue: string | null | undefined,
  tipoDatoCodigo?: string,
): string | null {
  const trimmed = rawValue?.trim()
  if (!trimmed) return null

  const codigo = (tipoDatoCodigo ?? "").toUpperCase()
  const opciones = atributo.opciones ?? []

  if (codigo === "BOOLEAN") {
    const normalized = trimmed.toLowerCase()
    if (normalized === "true") return "Sí"
    if (normalized === "false") return "No"
    return trimmed
  }

  if (codigo === "MULTISELECT" || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        const labels = parsed
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .map((item) => {
            const match = opciones.find(
              (opt) => opt.value.toLowerCase() === item.toLowerCase(),
            )
            return match?.label ?? item
          })
        return labels.length > 0 ? labels.join(", ") : null
      }
    } catch {
      // Fallback to raw trimmed string
    }
  }

  if (opciones.length > 0) {
    const match = opciones.find(
      (opt) => opt.value.toLowerCase() === trimmed.toLowerCase(),
    )
    if (match) return match.label
  }

  if (codigo === "DATE") {
    const parts = trimmed.split("-")
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
  }

  if (codigo === "DATETIME") {
    const d = new Date(trimmed)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  return trimmed
}

export function formatLocalDateLong(dateStr?: string | null): string | null {
  if (!dateStr) return null
  const parts = dateStr.split("-")
  const date =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
