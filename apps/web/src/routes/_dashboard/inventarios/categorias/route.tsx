import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/inventarios/categorias")({
  component: CategoriasInsumoLayout,
})

function CategoriasInsumoLayout() {
  return <Outlet />
}
