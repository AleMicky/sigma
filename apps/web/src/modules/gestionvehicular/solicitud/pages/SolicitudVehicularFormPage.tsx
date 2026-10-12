import { PageShell } from "@/shared/components/page-shell"
import { Card } from "@/shared/components/ui/card"
import { SolicitudVehicularFormErrorBanner } from "../components/form/SolicitudVehicularFormErrorBanner"
import { SolicitudVehicularFormFooter } from "../components/form/SolicitudVehicularFormFooter"
import { SolicitudVehicularFormHeader } from "../components/form/SolicitudVehicularFormHeader"
import { SolicitudVehicularFormSkeleton } from "../components/form/SolicitudVehicularFormSkeleton"
import { SolicitudVehicularGeneralSection } from "../components/form/SolicitudVehicularGeneralSection"
import { SolicitudVehicularItinerarioSection } from "../components/form/SolicitudVehicularItinerarioSection"
import { SolicitudVehicularNonEditableAlert } from "../components/form/SolicitudVehicularNonEditableAlert"
import { SolicitudVehicularNotFoundAlert } from "../components/form/SolicitudVehicularNotFoundAlert"
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
    isError,
    isEditable,
    isSubmitting,
    solicitud,
    handleSubmit,
  } = useSolicitudVehicularFormContext()

  // 1. Estado de carga con Skeleton para evitar parpadeos visuales (CLS)
  if (isEditing && isLoading) {
    return <SolicitudVehicularFormSkeleton />
  }

  // 2. Manejo de error cuando la solicitud no existe o la API falla
  if (isEditing && (!solicitud || isError)) {
    return <SolicitudVehicularNotFoundAlert />
  }

  // 3. Manejo de estado no editable (aprobada, cancelada, rechazada, etc.)
  if (isEditing && solicitud && !isEditable) {
    return <SolicitudVehicularNonEditableAlert estado={solicitud.estado} />
  }

  return (
    <PageShell className="h-full min-h-0 w-full overflow-y-auto px-2.5 py-2 sm:px-4 sm:py-3 md:px-6 space-y-2.5">
      <div className="w-full max-w-5xl mx-auto space-y-2.5 pb-6">
        {/* Encabezado y Navegación */}
        <SolicitudVehicularFormHeader />

        {/* Banner de error global */}
        <SolicitudVehicularFormErrorBanner />

        {/* Tarjeta contenedora del formulario con división de secciones */}
        <Card className="border border-border/70 bg-card/95 backdrop-blur-xs shadow-2xs rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-border/40">
            <fieldset
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="min-w-0 border-0 p-0 m-0 disabled:pointer-events-none disabled:opacity-75 transition-opacity"
            >
              {/* SECCIÓN 1: Clasificación y Solicitante */}
              <SolicitudVehicularGeneralSection />

              {/* SECCIÓN 2: Itinerario y Requerimientos */}
              <SolicitudVehicularItinerarioSection />

              {/* SECCIÓN 3: Ficha Resumen dinámica */}
              <SolicitudVehicularResumenCard />
            </fieldset>

            {/* Acciones de pie de página */}
            <SolicitudVehicularFormFooter />
          </form>
        </Card>
      </div>
    </PageShell>
  )
}

