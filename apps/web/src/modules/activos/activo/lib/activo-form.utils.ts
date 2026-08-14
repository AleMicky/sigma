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
