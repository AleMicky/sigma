import { createFileRoute } from "@tanstack/react-router"

import { RegistroMigracionPage } from "@/modules/organizacion/migracion/pages/RegistroMigracionPage"

export const Route = createFileRoute("/_dashboard/organizacion/migraciones/")({
  component: RegistroMigracionPage,
})
