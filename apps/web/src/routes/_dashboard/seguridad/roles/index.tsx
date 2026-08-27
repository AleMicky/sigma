import { createFileRoute } from "@tanstack/react-router"

import { RolesPage } from "@/modules/seguridad/rol/pages/RolesPage"

export const Route = createFileRoute("/_dashboard/seguridad/roles/")({
  component: RolesPage,
})
