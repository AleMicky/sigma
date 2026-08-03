import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/tipos-activo")({
  component: TiposActivoLayout,
})

function TiposActivoLayout() {
  return <Outlet />
}
