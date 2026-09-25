import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/gestion-vehicular")({
  component: GestionVehicularLayout,
})

function GestionVehicularLayout() {
  return <Outlet />
}
