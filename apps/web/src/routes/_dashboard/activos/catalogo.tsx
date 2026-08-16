import { createFileRoute } from "@tanstack/react-router"

import { ActivoCatalogoPage } from "@/modules/activos/activo/pages/ActivoCatalogoPage"

export const Route = createFileRoute("/_dashboard/activos/catalogo")({
  component: ActivoCatalogoRoute,
})

function ActivoCatalogoRoute() {
  return <ActivoCatalogoPage />
}
