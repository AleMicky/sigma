import { createFileRoute } from "@tanstack/react-router"

import { UsuariosPage } from "@/modules/seguridad/usuario/pages/UsuariosPage"

export const Route = createFileRoute("/_dashboard/seguridad/usuarios/")({
  component: UsuariosPage,
})
