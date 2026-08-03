import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/organizacion")({
  component: OrganizacionLayout,
})

function OrganizacionLayout() {
  return <Outlet />
}
