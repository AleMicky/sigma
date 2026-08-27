import { createResourceEndpoints } from "@/shared/api"

export const usuarioEndpoints = {
  ...createResourceEndpoints("/usuarios"),
  sincronizar: "/usuarios/sincronizar",
}
