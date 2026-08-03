import { createFileRoute } from "@tanstack/react-router"

import { AreasPage } from "@/modules/organizacion/area/pages/AreasPage"

export const Route = createFileRoute("/_dashboard/organizacion/areas/")({
  component: AreasPage,
})
