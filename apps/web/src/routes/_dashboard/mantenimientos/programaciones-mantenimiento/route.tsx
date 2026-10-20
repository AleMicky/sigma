import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/programaciones-mantenimiento",
)({
  component: Outlet,
})
