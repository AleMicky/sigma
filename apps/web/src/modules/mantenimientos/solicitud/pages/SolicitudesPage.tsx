import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { useDeleteSolicitud } from "../api/solicitud.mutations"
import { solicitudQueries } from "../api/solicitud.queries"
import type { SolicitudMantenimiento } from "../api/solicitud.service"
import { SolicitudFormDialog } from "../components/SolicitudFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function SolicitudesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SolicitudMantenimiento | null>(null)
  const [deleting, setDeleting] = useState<SolicitudMantenimiento | null>(null)

  const search = usePaginatedSearch()
  const deleteMutation = useDeleteSolicitud()

  const solicitudesQuery = useQuery(
    solicitudQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "createdAt",
      direction: "DESC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const solicitudes = solicitudesQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    solicitudesQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(solicitud: SolicitudMantenimiento) {
    setEditing(solicitud)
    setDialogOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      setDeleting(null)
    } catch {
      // Handled by mutation toast
    }
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-3 py-0 sm:px-5 md:px-6 lg:px-8 md:py-0">
      <header className="flex shrink-0 flex-col gap-2 border-b py-2.5 sm:gap-3 sm:py-3.5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex flex-1 flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-heading text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
              Solicitudes de Mantenimiento
            </h1>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Gestiona las solicitudes de mantenimiento de activos.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Crear Solicitud</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-2">
        {solicitudesQuery.isLoading ? (
          <ListSkeleton rows={5} className="flex flex-col gap-1.5" />
        ) : solicitudesQuery.isError ? (
          <EmptyState
            title={getErrorMessage(solicitudesQuery.error)}
            className="text-destructive"
          />
        ) : solicitudes.length === 0 ? (
          <EmptyState
            title="No hay solicitudes"
            description="Crea la primera solicitud de mantenimiento para comenzar."
            action={
              <Button size="sm" type="button" onClick={openCreate} className="h-8 text-xs">
                <Plus className="size-3.5" />
                Crear Solicitud
              </Button>
            }
          />
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-2">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="border p-4 rounded-lg shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">{solicitud.titulo}</h3>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{solicitud.estado}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{solicitud.descripcion}</p>
                    <div className="mt-auto pt-2 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(solicitud)}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleting(solicitud)}>Eliminar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {solicitudesQuery.data ? (
              <Pagination
                page={solicitudesQuery.data}
                onPageChange={search.setPage}
                className="-mx-3 border-x-0 px-3 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 shrink-0"
              />
            ) : null}
          </>
        )}
      </div>

      <SolicitudFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        solicitud={editing}
        onSuccess={() => !editing && search.setPage(0)}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`¿Eliminar solicitud "${deleting?.titulo}"?`}
        description="Esta acción no se puede deshacer."
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </PageShell>
  )
}
