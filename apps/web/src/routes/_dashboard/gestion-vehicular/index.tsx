import { createFileRoute } from "@tanstack/react-router"

import { GestionVehicularDashboardPage } from "@/modules/gestionvehicular/dashboard/pages/GestionVehicularDashboardPage"

export const Route = createFileRoute("/_dashboard/gestion-vehicular/")({
  component: GestionVehicularDashboardPage,
})
