import { createResourceEndpoints } from "@/shared/api"

export const ubicacionEndpoints = {
  ...createResourceEndpoints("/ubicaciones"),
  raices: "/ubicaciones/raices",
  arbol: "/ubicaciones/arbol",
  hijos: (id: string) => `/ubicaciones/${id}/hijos`,
  subArbol: (id: string) => `/ubicaciones/${id}/arbol`,
}
