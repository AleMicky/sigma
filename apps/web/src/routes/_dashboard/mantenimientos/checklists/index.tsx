import { createFileRoute } from "@tanstack/react-router"

import { ChecklistsPage } from "@/modules/mantenimientos/checklist/pages/ChecklistsPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/checklists/",
)({
  component: ChecklistsPage,
})
