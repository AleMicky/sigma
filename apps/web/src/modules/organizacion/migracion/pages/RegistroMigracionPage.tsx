import { PageShell } from "@/shared/components/page-shell"
import { MigracionLogViewer } from "../components/MigracionLogViewer"

export function RegistroMigracionPage() {
  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-1 border-b py-3 sm:py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Logs de Migración
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitoreo y auditoría de la migración de datos desde sistemas externos.
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        <MigracionLogViewer />
      </div>
    </PageShell>
  )
}
