import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_dashboard/inventarios/nuevo")({
  beforeLoad: () => {
    throw redirect({
      to: "/inventarios",
    })
  },
})
