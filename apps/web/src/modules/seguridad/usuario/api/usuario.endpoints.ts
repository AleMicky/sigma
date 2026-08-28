import { createResourceEndpoints } from "@/shared/api"

export const usuarioEndpoints = {
  ...createResourceEndpoints("/usuarios"),
  sincronizar: "/usuarios/sincronizar",
  persona: (id: string) => `/usuarios/${id}/persona`,
}
