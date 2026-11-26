import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FileText, Filter, Plus } from "lucide-react"

import { appConfig } from "@/app/config"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "@/shared/components/options-combobox"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { tipoDocumentoQueries } from "../api/tipo-documento.queries"
import type { TipoDocumento } from "../api/tipo-documento.service"
import { TipoDocumentoFormDialog } from "../components/TipoDocumentoFormDialog"
import { TipoDocumentoListView } from "../components/TipoDocumentoListView"

const PAGE_SIZE = appConfig.pagination.defaultPageSize

type VencimientoFilter = "ALL" | "VENCIMIENTO" | "PERMANENTE"

const VENCIMIENTO_OPTIONS: OptionsComboboxOption[] = [
  { value: "ALL", label: "Todos los documentos" },
  { value: "VENCIMIENTO", label: "Requiere Vencimiento" },
  { value: "PERMANENTE", label: "Sin Vencimiento" },
]

function renderVencimientoOption(option: OptionsComboboxOption) {
  return (
    <span className="flex min-w-0 items-center gap-2 truncate">
      <Filter className="size-3.5 shrink-0 text-primary" />
      <span className="truncate">{option.label}</span>
    </span>
  )
}

export function TiposDocumentoPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoDocumento | null>(null)
  const [vencimientoFilter, setVencimientoFilter] =
    useState<VencimientoFilter>("ALL")

  const search = usePaginatedSearch({
    resetKey: vencimientoFilter,
  })

  const tiposDocumentoQuery = useQuery(
    tipoDocumentoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      sortBy: "nombre",
      direction: "ASC",
      ...(search.query ? { q: search.query } : {}),
    }),
  )

  const rawTipos = useMemo(
    () => tiposDocumentoQuery.data?.content ?? [],
    [tiposDocumentoQuery.data?.content],
  )

  // Client-side filter for vencimiento
  const tiposDocumento = useMemo(() => {
    if (vencimientoFilter === "VENCIMIENTO") {
      return rawTipos.filter((t) => t.requiereVencimiento)
    }
    if (vencimientoFilter === "PERMANENTE") {
      return rawTipos.filter((t) => !t.requiereVencimiento)
    }
    return rawTipos
  }, [rawTipos, vencimientoFilter])

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

  function resetFilters() {
    search.setSearch("")
    setVencimientoFilter("ALL")
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 || vencimientoFilter !== "ALL"

  return (
    <PageShell layout="auto" className="w-full max-w-none gap-0 px-4 pb-6 sm:px-6 md:px-8 lg:px-10">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-3 border-b py-4 sm:gap-4 sm:py-6 md:flex-row md:items-start md:justify-between md:py-8">
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Tipos de Documento
            </h1>
            {tiposDocumentoQuery.data && (
              <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {tiposDocumentoQuery.data.totalElements}
              </span>
            )}
            <div className="flex items-center gap-1.5 md:hidden ml-auto">
              <RefreshButton queries={[tiposDocumentoQuery]} />
              <Button
                size="sm"
                type="button"
                onClick={openCreate}
                className="shrink-0"
              >
                <Plus className="size-4" />
                <span className="sr-only sm:not-sr-only">Crear</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Parametriza y estandariza los tipos de documentos, pólizas y garantías de activos.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start md:flex">
          <RefreshButton queries={[tiposDocumentoQuery]} />
          <Button
            size="sm"
            type="button"
            onClick={openCreate}
            className="shadow-xs"
          >
            <Plus className="size-4" />
            Nuevo Tipo de Documento
          </Button>
        </div>
      </header>

      {/* Toolbar con buscador y filtro */}
      <div className="flex shrink-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          value={search.search}
          onChange={search.setSearch}
          placeholder="Buscar por código, nombre o descripción…"
          aria-label="Buscar tipos de documento"
          className="w-full flex-1 min-w-0"
        />

        <div className="w-full sm:w-64 shrink-0">
          <OptionsCombobox
            options={VENCIMIENTO_OPTIONS}
            value={vencimientoFilter}
            onValueChange={(val) => {
              setVencimientoFilter((val as VencimientoFilter) || "ALL")
              search.setPage(0)
            }}
            placeholder="Todos los documentos"
            ariaLabel="Filtrar por vencimiento"
            size="sm"
            className="w-full"
            renderOption={renderVencimientoOption}
            renderValue={renderVencimientoOption}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col gap-3">
        {tiposDocumentoQuery.isLoading ? (
          <ListSkeleton
            rows={6}
            rowClassName="h-16 rounded-xl"
            className="space-y-2.5"
          />
        ) : tiposDocumentoQuery.isError ? (
          <EmptyState
            title={getErrorMessage(tiposDocumentoQuery.error)}
            className="text-destructive"
          />
        ) : tiposDocumento.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para el filtro aplicado"
                : "No hay tipos de documento"
            }
            description={
              hasActiveFilters
                ? "Prueba cambiando los filtros o borrando el término de búsqueda."
                : "Comienza registrando el primer tipo de documento para los activos del sistema."
            }
            action={
              hasActiveFilters ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl"
                >
                  Limpiar Filtros
                </Button>
              ) : (
                <Button
                  size="sm"
                  type="button"
                  onClick={openCreate}
                  className="rounded-xl"
                >
                  <Plus className="size-4" />
                  Crear Tipo de Documento
                </Button>
              )
            }
          />
        ) : (
          <>
            <div
              className={cn(
                "pb-4",
                tiposDocumentoQuery.isFetching && "opacity-70",
              )}
            >
              <TipoDocumentoListView
                tiposDocumento={tiposDocumento}
                onEdit={openEdit}
              />
            </div>

            {tiposDocumentoQuery.data ? (
              <Pagination
                page={tiposDocumentoQuery.data}
                onPageChange={search.setPage}
                className="-mx-4 border-x-0 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 py-3"
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
