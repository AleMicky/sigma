import { describe, expect, it } from "vitest"

import type { EstadoOperativo } from "@/modules/activos/estado-operativo/api/estado-operativo.service"
import type { TipoActivoEstado } from "@/modules/activos/tipo-activo-estado/api/tipo-activo-estado.service"

import {
  includeCurrentEstadoOption,
  resolveEstadoPredeterminadoId,
  resolveEstadosDelTipo,
} from "./estado-operativo.utils"

function estado(id: string, nombre: string): EstadoOperativo {
  return { id, nombre } as EstadoOperativo
}

function asignacion(
  estadoOperativoId: string,
  predeterminado = false,
): TipoActivoEstado {
  return {
    tipoActivoId: "tipo-1",
    estadoOperativoId,
    predeterminado,
  } as TipoActivoEstado
}

const estados = [
  estado("operativo", "Operativo"),
  estado("mantenimiento", "Mantenimiento"),
  estado("baja", "De baja"),
]

describe("resolveEstadosDelTipo", () => {
  it("devuelve solo los estados asignados al tipo", () => {
    const result = resolveEstadosDelTipo(
      [asignacion("operativo", true), asignacion("baja")],
      estados,
    )

    expect(result.map((item) => item.id)).toEqual(["operativo", "baja"])
  })

  it("no incluye estados del catálogo global que no estén asignados", () => {
    expect(resolveEstadosDelTipo([], estados)).toEqual([])
  })
})

describe("resolveEstadoPredeterminadoId", () => {
  it("devuelve el predeterminado del catálogo del tipo", () => {
    expect(
      resolveEstadoPredeterminadoId([
        asignacion("operativo"),
        asignacion("mantenimiento", true),
      ]),
    ).toBe("mantenimiento")
  })

  it("devuelve null si no hay predeterminado", () => {
    expect(resolveEstadoPredeterminadoId([asignacion("operativo")])).toBeNull()
    expect(resolveEstadoPredeterminadoId([])).toBeNull()
  })
})

describe("includeCurrentEstadoOption", () => {
  it("no duplica el estado actual cuando ya es válido", () => {
    const permitidos = resolveEstadosDelTipo(
      [asignacion("operativo", true)],
      estados,
    )

    expect(
      includeCurrentEstadoOption(permitidos, "operativo", estados),
    ).toEqual(permitidos)
  })

  it("conserva el estado actual de una edición aunque ya no esté en el catálogo", () => {
    const permitidos = resolveEstadosDelTipo(
      [asignacion("operativo", true)],
      estados,
    )

    expect(
      includeCurrentEstadoOption(permitidos, "baja", estados).map(
        (item) => item.id,
      ),
    ).toEqual(["baja", "operativo"])
  })

  it("ignora un estado actual que no existe", () => {
    expect(
      includeCurrentEstadoOption([], "inexistente", estados),
    ).toEqual([])
  })
})
