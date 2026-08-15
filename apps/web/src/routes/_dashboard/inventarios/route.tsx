import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/inventarios")({
  component: InventariosLayout,
})

function InventariosLayout() {
  return <Outlet />
}
