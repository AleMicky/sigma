import { PageShell } from "@/shared/components/page-shell"
import { SolicitudHeader } from "../components/SolicitudHeader"


export function SolicitudesPage() {
  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      <SolicitudHeader />
    </PageShell>
  )
}
