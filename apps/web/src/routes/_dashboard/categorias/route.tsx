import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/categorias")({
  component: CategoriasLayout,
})

function CategoriasLayout() {
  return <Outlet />
}
