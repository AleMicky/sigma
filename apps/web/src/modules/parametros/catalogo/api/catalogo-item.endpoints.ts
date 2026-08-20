import { createResourceEndpoints } from "@/shared/api"

const base = createResourceEndpoints("/catalogo-items")

export const catalogoItemEndpoints = {
  ...base,
  byCodigo: (codigo: string) =>
    `/catalogo-items/by-codigo/${encodeURIComponent(codigo)}`,
}
