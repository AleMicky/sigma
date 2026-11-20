import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import {
  createActivoAtributoValor,
  updateActivoAtributoValor,
  type ActivoAtributoValor,
} from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.service"

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
  await Promise.all(
    atributos.map(async (atributo) => {
      const raw = valores[atributo.id]?.trim() ?? ""
      const valor = raw.length > 0 ? raw : null
      const existing = existentes.get(atributo.id)

      if (existing) {
        if ((existing.valor ?? null) === valor) return
        await updateActivoAtributoValor(existing.id, {
          activoId,
          activoAtributoId: atributo.id,
          valor,
        })
        return
      }

      if (valor == null) return

      await createActivoAtributoValor({
        activoId,
        activoAtributoId: atributo.id,
        valor,
      })
    }),
  )
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
