import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/seguridad")({
  component: SeguridadLayout,
})

function SeguridadLayout() {
  return <Outlet />
}
