import { Loader2 } from "lucide-react"

import { PageShell } from "@/shared/components/page-shell"
import { Card } from "@/shared/components/ui/card"
import { SolicitudVehicularFormErrorBanner } from "../components/form/SolicitudVehicularFormErrorBanner"
import { SolicitudVehicularFormFooter } from "../components/form/SolicitudVehicularFormFooter"
import { SolicitudVehicularFormHeader } from "../components/form/SolicitudVehicularFormHeader"
import { SolicitudVehicularGeneralSection } from "../components/form/SolicitudVehicularGeneralSection"
import { SolicitudVehicularItinerarioSection } from "../components/form/SolicitudVehicularItinerarioSection"
import { SolicitudVehicularNonEditableAlert } from "../components/form/SolicitudVehicularNonEditableAlert"
import { SolicitudVehicularResumenCard } from "../components/form/SolicitudVehicularResumenCard"
import {
  SolicitudVehicularFormProvider,
  useSolicitudVehicularFormContext,
} from "../context/solicitud-vehicular-form.context"

type SolicitudVehicularFormPageProps = {
  solicitudId?: string
}

export function SolicitudVehicularFormPage({
  solicitudId,
}: SolicitudVehicularFormPageProps) {
  return (
    <SolicitudVehicularFormProvider solicitudId={solicitudId}>
      <SolicitudVehicularFormContent />
    </SolicitudVehicularFormProvider>
  )
}

function SolicitudVehicularFormContent() {
  const {
    isEditing,
    isLoading,
    isEditable,
    solicitud,
    handleSubmit,
  } = useSolicitudVehicularFormContext()

  if (isEditing && isLoading) {
    return (
      <PageShell className="h-full min-h-0 w-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">
            Cargando datos de la solicitud vehicular...
          </p>
        </div>
      </PageShell>
    )
  }

  if (isEditing && solicitud && !isEditable) {
    return <SolicitudVehicularNonEditableAlert estado={solicitud.estado} />
  }

  return (
    <PageShell className="h-full min-h-0 w-full overflow-y-auto p-2 sm:p-3 md:p-4">
      <div className="w-full max-w-5xl mx-auto space-y-2.5 pb-4">
        {/* Encabezado */}
        <SolicitudVehicularFormHeader />

        {/* Banner de error global */}
        <SolicitudVehicularFormErrorBanner />

        {/* Tarjeta contenedora del formulario */}
        <Card className="border border-border/80 bg-card shadow-2xs rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-border/50">
            {/* SECCIÓN 1: Clasificación y Solicitante */}
            <SolicitudVehicularGeneralSection />

            {/* SECCIÓN 2: Itinerario y Requerimientos */}
            <SolicitudVehicularItinerarioSection />

            {/* SECCIÓN 3: Resumen dinámico */}
            <SolicitudVehicularResumenCard />

            {/* Acciones de pie de página */}
            <SolicitudVehicularFormFooter />
          </form>
        </Card>
      </div>
    </PageShell>
  )
}
