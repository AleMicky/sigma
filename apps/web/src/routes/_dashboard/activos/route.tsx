import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/activos")({
  component: ActivosLayout,
})

function ActivosLayout() {
  return <Outlet />
}
