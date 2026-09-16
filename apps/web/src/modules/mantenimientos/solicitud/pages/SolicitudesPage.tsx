import { PageShell } from "@/shared/components/page-shell"

import { SolicitudHeader } from "../components/SolicitudHeader"
import { useSolicitudRoleScope } from "../hooks/use-solicitud-role-scope"

export function SolicitudesPage() {
  const { isAdmin, scope, setScope } = useSolicitudRoleScope()

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      <SolicitudHeader
        isAdmin={isAdmin}
        scope={scope}
        onScopeChange={setScope}
      />
    </PageShell>
  )
}
