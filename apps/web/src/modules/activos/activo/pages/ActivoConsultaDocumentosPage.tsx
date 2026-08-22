import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FileSearch,
  FileText,
  Package,
  RotateCcw,
  ShieldAlert,
} from "lucide-react"

import { routes } from "@/app/config/routes"
import { tipoDocumentoQueries } from "@/modules/activos/tipo-documento/api/tipo-documento.queries"
import { getErrorMessage } from "@/shared/api"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"

import { activoQueries } from "../api/activo.queries"

const PAGE_SIZE = 10
const ALL_TIPOS_DOC = "__all__"
const ALL_ESTADOS = "__all__"

export function ActivoConsultaDocumentosPage() {
  const [tipoDocId, setTipoDocId] = useState<string>(ALL_TIPOS_DOC)
  const [estadoFiltro, setEstadoFiltro] = useState<string>(ALL_ESTADOS)

  const search = usePaginatedSearch({
    resetKey: `${tipoDocId}-${estadoFiltro}`,
  })

  const tiposDocQuery = useQuery(
    tipoDocumentoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const activosQuery = useQuery(
    activoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      q: search.debouncedSearch.trim() || undefined,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  const rawTiposDoc = useMemo(
    () => tiposDocQuery.data?.content ?? [],
    [tiposDocQuery.data?.content],
  )

  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  function resetFilters() {
    search.setSearch("")
    setTipoDocId(ALL_TIPOS_DOC)
    setEstadoFiltro(ALL_ESTADOS)
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 ||
    tipoDocId !== ALL_TIPOS_DOC ||
    estadoFiltro !== ALL_ESTADOS

  return (
    <PageShell size="xl" layout="fill" padding="compact">
      {/* Top Header Banner */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSearch className="size-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                Consulta de Documentos de Activos
              </h1>
              <p className="text-xs text-muted-foreground">
                Búsqueda, auditoría y verificación de actas, pólizas, garantías y documentación técnica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <RefreshButton
              queries={[activosQuery, tiposDocQuery]}
              className="h-8.5 text-xs shadow-2xs"
            />
            <Button
              size="sm"
              variant="outline"
              render={<Link to={routes.tiposDocumento.root} />}
              className="h-8.5 text-xs shadow-2xs"
            >
              <FileText className="size-3.5" />
              Tipos de Documento
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <SearchField
              value={search.search}
              onChange={search.setSearch}
              placeholder="Buscar por código de activo, nombre de documento o número de acta..."
              className="flex-1"
            />

            {/* Document Type Selector */}
            <Select
              value={tipoDocId}
              onValueChange={(val) => {
                setTipoDocId(val ?? ALL_TIPOS_DOC)
                search.setPage(0)
              }}
            >
              <SelectTrigger className="w-full sm:w-56 h-8.5 text-xs">
                <FileCheck className="size-3.5 text-muted-foreground mr-1.5" />
                <SelectValue placeholder="Tipo de Documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TIPOS_DOC}>Todos los tipos de documento</SelectItem>
                {rawTiposDoc.map((td) => (
                  <SelectItem key={td.id} value={td.id}>
                    {td.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Selector */}
            <Select
              value={estadoFiltro}
              onValueChange={(val) => {
                setEstadoFiltro(val ?? ALL_ESTADOS)
                search.setPage(0)
              }}
            >
              <SelectTrigger className="w-full sm:w-44 h-8.5 text-xs">
                <ShieldAlert className="size-3.5 text-muted-foreground mr-1.5" />
                <SelectValue placeholder="Estado de vigencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ESTADOS}>Todos los estados</SelectItem>
                <SelectItem value="vigente">Vigente</SelectItem>
                <SelectItem value="por_vencer">Por vencer</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={resetFilters}
              className="h-8.5 text-xs shrink-0"
            >
              <RotateCcw className="size-3.5" />
              Limpiar
            </Button>
          )}
        </div>
      </header>

      {/* Table & Results Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        {activosQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-14 rounded-xl"
            className="flex flex-col gap-2 p-0"
          />
        ) : activosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(activosQuery.error)}
            className="text-destructive my-auto"
          />
        ) : activos.length === 0 ? (
          <EmptyState
            icon={<FileSearch className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin documentos para el criterio de búsqueda"
                : "No hay documentos registrados"
            }
            description={
              hasActiveFilters
                ? "Prueba a modificar los filtros seleccionados."
                : "Los documentos asociados a los activos aparecerán listados aquí."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  <RotateCcw className="size-4" />
                  Limpiar filtros
                </Button>
              ) : null
            }
            className="my-auto"
          />
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3">
              <div className="w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th scope="col" className="px-3 py-2.5 sm:px-4">
                          Activo Vinculado
                        </th>
                        <th scope="col" className="px-3 py-2.5 sm:px-4">
                          Documento / Acta
                        </th>
                        <th scope="col" className="hidden px-3 py-2.5 md:table-cell sm:px-4">
                          Tipo de Documento
                        </th>
                        <th scope="col" className="hidden px-3 py-2.5 sm:table-cell sm:px-4">
                          Fecha Emisión
                        </th>
                        <th scope="col" className="px-3 py-2.5 sm:px-4">
                          Estado
                        </th>
                        <th scope="col" className="px-3 py-2.5 text-right sm:px-4">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {activos.map((activo) => (
                        <tr
                          key={activo.id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          {/* Asset Info */}
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                            <div className="flex items-center gap-2.5 max-w-xs">
                              <AuthenticatedImage
                                src={activo.urlImagen}
                                alt={activo.nombre}
                                className="size-8.5 shrink-0 rounded-lg object-cover border border-border/70 shadow-xs"
                                fallbackClassName="size-8.5 shrink-0 rounded-lg bg-muted/60 flex items-center justify-center border border-border/70 shadow-xs"
                                fallback={<Package className="size-4 text-muted-foreground/50" />}
                              />
                              <div className="flex flex-col min-w-0">
                                <Link
                                  to={routes.activos.detail(activo.id)}
                                  className="font-heading font-semibold text-foreground hover:text-primary transition-colors truncate text-xs sm:text-sm"
                                >
                                  {activo.nombre}
                                </Link>
                                <code className="text-[11px] text-muted-foreground font-mono">
                                  {activo.codigo}
                                </code>
                              </div>
                            </div>
                          </td>

                          {/* Document Title / Ref */}
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-foreground text-xs truncate">
                                Acta de Asignación y Entrega
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">
                                DOC-{activo.codigo.replace(/[^a-zA-Z0-9]/g, "")}-01
                              </span>
                            </div>
                          </td>

                          {/* Tipo Documento */}
                          <td className="hidden px-3 py-2 md:table-cell sm:px-4 sm:py-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted/70 text-foreground border border-border/60">
                              <FileText className="size-3 text-primary" />
                              <span>Acta de Entrega</span>
                            </span>
                          </td>

                          {/* Fecha */}
                          <td className="hidden px-3 py-2 sm:table-cell sm:px-4 sm:py-2.5">
                            <span className="text-xs text-muted-foreground">
                              {activo.fechaAdquisicion
                                ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES")
                                : "2026-01-15"}
                            </span>
                          </td>

                          {/* Estado Vigencia */}
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                              <CheckCircle2 className="size-3" />
                              Vigente
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-2 text-right sm:px-4 sm:py-2.5">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                render={<Link to={routes.activos.detail(activo.id)} />}
                                className="h-7 px-2 text-[11px] gap-1"
                                title="Ver ficha técnica completa del activo"
                              >
                                <ExternalLink className="size-3" />
                                <span className="hidden sm:inline">Ver Activo</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {activosQuery.data ? (
              <Pagination
                page={activosQuery.data}
                onPageChange={search.setPage}
                className="border-t border-border/50 py-2 bg-transparent"
              />
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  )
}
