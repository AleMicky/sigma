import { Loader2 } from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"
import { Card } from "@/shared/components/ui/card"
import { SolicitudClasificacionSection } from "../components/form/SolicitudClasificacionSection"
import { SolicitudFormErrorBanner } from "../components/form/SolicitudFormErrorBanner"
import { SolicitudFormFooter } from "../components/form/SolicitudFormFooter"
import { SolicitudFormHeader } from "../components/form/SolicitudFormHeader"
import { SolicitudNonEditableAlert } from "../components/form/SolicitudNonEditableAlert"
import { SolicitudResumenCard } from "../components/form/SolicitudResumenCard"
import { SolicitudTecnicaSection } from "../components/form/SolicitudTecnicaSection"
import {
  SolicitudFormProvider,
  useSolicitudFormContext,
} from "../context/solicitud-form.context"

type SolicitudFormPageProps = {
  solicitudId?: string
}

export function SolicitudFormPage({ solicitudId }: SolicitudFormPageProps) {
  return (
    <SolicitudFormProvider solicitudId={solicitudId}>
      <SolicitudFormContent />
    </SolicitudFormProvider>
  )
}

function SolicitudFormContent() {
  const {
    isEditing,
    isLoading,
    isEditable,
    solicitud,
    handleSubmit,
  } = useSolicitudFormContext()

  if (isEditing && isLoading) {
    return (
      <PageShell className="h-full min-h-0 w-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Cargando datos de la solicitud...</p>
        </div>
      </PageShell>
    )
  }

  if (isEditing && solicitud && !isEditable) {
    return <SolicitudNonEditableAlert estado={solicitud.estado} />
  }

  return (
    <PageShell className="h-full min-h-0 w-full overflow-y-auto px-3 py-3 sm:px-6 sm:py-5 md:px-8">
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
        {/* Encabezado */}
        <SolicitudFormHeader />

        {/* Banner de error global */}
        <SolicitudFormErrorBanner />

        {/* Tarjeta contenedora del formulario */}
        <Card className="border border-border/80 bg-card/95 shadow-sm rounded-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-border/60">
            {/* SECCIÓN 1: Clasificación y Solicitante */}
            <SolicitudClasificacionSection />

            {/* SECCIÓN 2: Activo y Descripción Técnica */}
            <SolicitudTecnicaSection />

            {/* SECCIÓN 3: Resumen dinámico */}
            <SolicitudResumenCard />

            {/* Acciones de pie de página */}
            <SolicitudFormFooter />
          </form>
        </Card>
      </div>
    </PageShell>
  )
}
