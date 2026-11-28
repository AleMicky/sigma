import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/cuestionarios")({
  component: CuestionariosLayout,
})

function CuestionariosLayout() {
  return <Outlet />
}
