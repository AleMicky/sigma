import { createFileRoute } from "@tanstack/react-router"

import { CuestionariosResultadosPage } from "@/modules/cuestionarios/pages/CuestionariosResultadosPage"

export const Route = createFileRoute("/_dashboard/cuestionarios/resultados")({
  component: CuestionariosResultadosPage,
})
