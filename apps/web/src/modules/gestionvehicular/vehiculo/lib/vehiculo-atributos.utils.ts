import type { VehiculoAtributo, VehiculoCatalogo } from "../api/vehiculo.types"

export function isPlacaAtributo(attr: VehiculoAtributo): boolean {
  const codigo = attr.codigo.trim().toUpperCase()
  const etiqueta = attr.etiqueta.trim().toUpperCase()
  return (
    codigo === "PLACA" ||
    codigo === "NRO_PLACA" ||
    codigo === "NUMERO_PLACA" ||
    etiqueta === "PLACA" ||
    etiqueta.includes("PLACA")
  )
}

export function getAtributosVisibles(
  vehiculo: Pick<VehiculoCatalogo, "atributos">,
): VehiculoAtributo[] {
  return (vehiculo.atributos ?? [])
    .filter((attr) => attr.visible === true)
    .slice()
    .sort((a, b) => a.orden - b.orden)
}

export function getPlacaFromAtributos(
  vehiculo: Pick<VehiculoCatalogo, "atributos">,
): { atributo: VehiculoAtributo | null; valor: string | null } {
  const visibles = getAtributosVisibles(vehiculo)
  const placaAttr = visibles.find(isPlacaAtributo) ?? null
  const valor = (placaAttr?.valorFormateado ?? placaAttr?.valor)?.trim() || null
  return { atributo: placaAttr, valor }
}

export function getVehiculoTituloDinamico(
  vehiculo: Pick<VehiculoCatalogo, "atributos" | "tipoActivo">,
): string {
  const visibles = getAtributosVisibles(vehiculo)
  const sinPlaca = visibles
    .filter(
      (a) =>
        !isPlacaAtributo(a) &&
        a.tipoDatoCodigo !== "TEXTAREA" &&
        Boolean((a.valorFormateado ?? a.valor)?.trim()),
    )
    .slice(0, 2)
    .map((a) => (a.valorFormateado ?? a.valor)!.trim())

  if (sinPlaca.length > 0) {
    return sinPlaca.join(" · ")
  }

  const { valor: placa } = getPlacaFromAtributos(vehiculo)
  if (placa) {
    return placa
  }

  return vehiculo.tipoActivo?.nombre || "Vehículo"
}

export function getAtributoValorByCode(
  vehiculo: Pick<VehiculoCatalogo, "atributos"> | null | undefined,
  codes: string[],
): string | null {
  if (!vehiculo) return null
  const normalizedCodes = new Set(codes.map((c) => c.trim().toUpperCase()))
  const visibles = getAtributosVisibles(vehiculo)
  const found = visibles.find(
    (attr) =>
      normalizedCodes.has(attr.codigo.trim().toUpperCase()) ||
      normalizedCodes.has(attr.etiqueta.trim().toUpperCase()),
  )
  return (found?.valorFormateado ?? found?.valor)?.trim() || null
}
