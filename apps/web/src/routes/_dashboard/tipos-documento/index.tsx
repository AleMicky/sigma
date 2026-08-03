import { createFileRoute } from "@tanstack/react-router"

import { TiposDocumentoPage } from "@/modules/activos/tipo-documento/pages/TiposDocumentoPage"

export const Route = createFileRoute("/_dashboard/tipos-documento/")({
  component: TiposDocumentoPage,
})
