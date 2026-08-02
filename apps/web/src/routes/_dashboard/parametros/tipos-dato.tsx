import { createFileRoute } from "@tanstack/react-router"

import { TiposDatoPage } from "@/modules/parametros/tipo-dato/pages/TiposDatoPage"

export const Route = createFileRoute("/_dashboard/parametros/tipos-dato")({
  component: TiposDatoPage,
})
