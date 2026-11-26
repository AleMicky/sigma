export function extractPlaca(descripcion?: string | null): string | null {
  if (!descripcion) return null
  try {
    const match = descripcion.match(
      /PLACA(?:\s*(?:N[°o.]+|NRO\.?|NUM\.?|#))?[:\s#.-]+([0-9A-Za-z]+(?:[\s-][0-9A-Za-z]+)?)(?:\s+(?:CHASIS|MOTOR|COLOR|MARCA|MODELO|AÑO|ANIO|TIPO)|[,;.]|\s*$)/i
    )
    if (match && match[1]) {
      const clean = match[1].replace(/[,.;-]+$/, "").trim()
      if (
        clean.length >= 2 &&
        clean.length <= 20 &&
        !clean.toUpperCase().startsWith("NO") &&
        clean.toUpperCase() !== "NRO"
      ) {
        return clean
      }
    }
    return null
  } catch {
    return null
  }
}

export function isVehiculoDisponible(estadoNombre?: string | null): boolean {
  if (!estadoNombre) return true
  const norm = estadoNombre.trim().toUpperCase()
  if (
    norm.includes("VIAJE") ||
    norm.includes("MANTENIMIENTO") ||
    norm.includes("FUERA") ||
    norm.includes("BAJA")
  ) {
    return false
  }
  return true
}
