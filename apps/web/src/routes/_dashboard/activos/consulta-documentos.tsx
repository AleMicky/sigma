import { createFileRoute } from "@tanstack/react-router"

import { ActivoConsultaDocumentosPage } from "@/modules/activos/activo/pages/ActivoConsultaDocumentosPage"

export const Route = createFileRoute(
  "/_dashboard/activos/consulta-documentos",
)({
  component: ActivoConsultaDocumentosRoute,
})

function ActivoConsultaDocumentosRoute() {
  return <ActivoConsultaDocumentosPage />
}
