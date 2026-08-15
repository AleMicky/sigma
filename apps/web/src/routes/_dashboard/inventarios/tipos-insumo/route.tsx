import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/inventarios/tipos-insumo")({
  component: TiposInsumoLayout,
})

function TiposInsumoLayout() {
  return <Outlet />
}
