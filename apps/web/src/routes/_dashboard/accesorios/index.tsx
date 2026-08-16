import { createFileRoute } from "@tanstack/react-router"

import { AccesoriosPage } from "@/modules/activos/accesorio/pages/AccesoriosPage"

export const Route = createFileRoute("/_dashboard/accesorios/")({
  component: AccesoriosPage,
})
