import { createFileRoute } from "@tanstack/react-router"

import { PreventivoHubPage } from "@/modules/mantenimientos/preventivo/pages/PreventivoHubPage"

export const Route = createFileRoute("/_dashboard/mantenimientos/preventivo/")({
  component: PreventivoHubPage,
})
