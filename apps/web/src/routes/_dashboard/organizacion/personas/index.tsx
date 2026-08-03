import { createFileRoute } from "@tanstack/react-router"

import { PersonasPage } from "@/modules/organizacion/persona/pages/PersonasPage"

export const Route = createFileRoute("/_dashboard/organizacion/personas/")({
  component: PersonasPage,
})
