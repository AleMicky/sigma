import { createFileRoute } from "@tanstack/react-router"

import { GestionesPage } from "@/modules/parametros/gestion/pages/GestionesPage"

export const Route = createFileRoute("/_dashboard/parametros/gestion")({
  component: GestionesPage,
})
