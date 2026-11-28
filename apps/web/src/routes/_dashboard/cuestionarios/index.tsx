import { createFileRoute } from "@tanstack/react-router"

import { CuestionariosPage } from "@/modules/cuestionarios/pages/CuestionariosPage"

export const Route = createFileRoute("/_dashboard/cuestionarios/")({
  component: CuestionariosPage,
})
