import { createFileRoute } from "@tanstack/react-router"

import { PlanPreventivoWizardPage } from "@/modules/mantenimientos/plan-mantenimiento/pages/PlanPreventivoWizardPage"

function EditPlanPreventivoRoute() {
  const { planId } = Route.useParams()
  return <PlanPreventivoWizardPage planId={planId} />
}

export const Route = createFileRoute(
  "/_dashboard/mantenimientos/planes-mantenimiento/$planId/editar",
)({
  component: EditPlanPreventivoRoute,
})
