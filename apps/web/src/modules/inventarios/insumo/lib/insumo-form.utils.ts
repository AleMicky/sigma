import {
  createInsumoAtributoValor,
  updateInsumoAtributoValor,
  type InsumoAtributoValor,
} from "@/modules/inventarios/insumo-atributo-valor/api/insumo-atributo-valor.service"
import type { TipoInsumoAtributo } from "@/modules/inventarios/tipo-insumo-atributo/api/tipo-insumo-atributo.service"

export function validateInsumoAtributos(
  atributos: TipoInsumoAtributo[],
  valores: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const atributo of atributos) {
    if (!atributo.requerido) continue
    const value = valores[atributo.id]?.trim() ?? ""
    if (!value) {
      errors[atributo.id] = `El atributo "${atributo.nombre}" es obligatorio`
    }
  }

  return errors
}

export async function syncInsumoAtributoValores({
  insumoId,
  atributos,
  valores,
  existentes,
}: {
  insumoId: string
  atributos: TipoInsumoAtributo[]
  valores: Record<string, string>
  existentes: Map<string, InsumoAtributoValor>
}) {
  await Promise.all(
    atributos.map(async (atributo) => {
      const raw = valores[atributo.id]?.trim() ?? ""
      const existing = existentes.get(atributo.id)

      if (existing) {
        if (existing.valor === raw) return
        await updateInsumoAtributoValor(existing.id, {
          insumoId,
          tipoInsumoAtributoId: atributo.id,
          valor: raw,
        })
        return
      }

      if (!raw) return

      await createInsumoAtributoValor({
        insumoId,
        tipoInsumoAtributoId: atributo.id,
        valor: raw,
      })
    }),
  )
}
