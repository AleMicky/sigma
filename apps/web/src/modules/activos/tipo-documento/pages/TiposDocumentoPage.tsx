import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { tipoDocumentoQueries } from "../api/tipo-documento.queries"
import type { TipoDocumento } from "../api/tipo-documento.service"
import { TipoDocumentoCard } from "../components/TipoDocumentoCard"
import { TipoDocumentoFormDialog } from "../components/TipoDocumentoFormDialog"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

export function TiposDocumentoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoDocumento | null>(null)
  const search = usePaginatedSearch()

  const tiposDocumentoQuery = useQuery(
    tipoDocumentoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const tiposDocumento = tiposDocumentoQuery.data?.content ?? []

  useClampPage(
    search.page,
    search.setPage,
    tiposDocumentoQuery.data?.totalPages,
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(tipoDocumento: TipoDocumento) {
    setEditing(tipoDocumento)
    setDialogOpen(true)
  }

  return (
    <PageShell className="h-full min-h-0 w-full max-w-none gap-0 overflow-hidden px-4 py-0 sm:px-6 md:px-8 lg:px-10 md:py-0">
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Tipos de documento
            </h1>
            <Button
              size="sm"
              type="button"
              onClick={openCreate}
              className="shrink-0 md:hidden"
            >
              <Plus />
              <span className="sr-only sm:not-sr-only">Crear</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Administra los tipos de documento asociados a los activos, como facturas, pólizas o garantías.
          </p>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          className="hidden shrink-0 self-start md:inline-flex"
        >
          <Plus />
          Crear
        </Button>
      </header>

      <div className="flex shrink-0 py-3">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código o nombre…"
          aria-label="Buscar tipos de documento"
          className="w-full min-w-0"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tiposDocumentoQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-24 rounded-xl"
            className="grid grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          />
        ) : tiposDocumentoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposDocumentoQuery.error)}
            className="text-destructive"
          />
        ) : tiposDocumento.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-4 text-muted-foreground" />}
            title={
              search.search.trim()
                ? "Sin resultados"
                : "No hay tipos de documento"
            }
            description={
              search.search.trim()
                ? "Prueba con otro código o nombre."
                : "Crea un tipo de documento, por ejemplo FACTURA."
            }
            action={
              search.search.trim() ? undefined : (
                <Button size="sm" type="button" onClick={openCreate}>
                  <Plus />
                  Crear
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3",
                tiposDocumentoQuery.isFetching && "opacity-70",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {tiposDocumento.map((tipoDocumento) => (
                  <TipoDocumentoCard
                    key={tipoDocumento.id}
                    tipoDocumento={tipoDocumento}
                    onEdit={openEdit}
                  />
                ))}
              </ul>
            </div>

            {tiposDocumentoQuery.data ? (
              <Pagination
                page={tiposDocumentoQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10"
              />
            ) : null}
          </>
        )}
      </div>

      <TipoDocumentoFormDialog
        key={editing?.id ?? "new-tipo-documento"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoDocumento={editing}
        onSuccess={() => {
          if (!editing) {
            search.setPage(0)
          }
        }}
      />
    </PageShell>
  )
}
