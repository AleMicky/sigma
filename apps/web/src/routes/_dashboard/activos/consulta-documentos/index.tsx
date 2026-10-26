import { ActivoConsultaDocumentosPage } from '@/modules/activos/activo/pages/ActivoConsultaDocumentosPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_dashboard/activos/consulta-documentos/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return <ActivoConsultaDocumentosPage />
}
