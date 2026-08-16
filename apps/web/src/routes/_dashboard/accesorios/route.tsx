import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/accesorios")({
  component: AccesoriosLayout,
})

function AccesoriosLayout() {
  return <Outlet />
}
