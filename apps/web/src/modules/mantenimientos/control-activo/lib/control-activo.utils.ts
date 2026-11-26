export function formatEstadoLabel(estado?: string | null): string {
  if (!estado) return "Registrado"
  const clean = estado.replace(/_/g, " ").trim().toLowerCase()
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}
