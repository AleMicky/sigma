import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/estados-operativos")({
  component: EstadosOperativosLayout,
})

function EstadosOperativosLayout() {
  return <Outlet />
}
