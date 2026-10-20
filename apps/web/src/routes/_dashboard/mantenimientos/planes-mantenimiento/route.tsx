import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/planes-mantenimiento",
)({
  component: Outlet,
})
