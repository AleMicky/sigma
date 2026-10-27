import { GestionVehicularDashboardPage } from "@/modules/gestionvehicular/dashboard/pages/GestionVehicularDashboardPage"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_dashboard/gestion-vehicular/dashboard-gestion-vehicular/',
)({
    component: GestionVehicularDashboardPage,
})

