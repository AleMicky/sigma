import { createFileRoute } from "@tanstack/react-router"

import { PlanPreventivoWizardPage } from "@/modules/mantenimientos/plan-mantenimiento/pages/PlanPreventivoWizardPage"

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/planes-mantenimiento/nuevo",
)({
  component: PlanPreventivoWizardPage,
})
