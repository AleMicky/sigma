import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  LayoutGrid,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Tag,
} from "lucide-react"

import { routes } from "@/app/config/routes"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Pagination } from "@/shared/components/pagination"
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
import { cn } from "@/shared/lib/utils"

import { activoQueries } from "../api/activo.queries"
import { ActivoCard } from "../components/ActivoCard"

const PAGE_SIZE = 12
const ALL_TIPOS = "__all__"
const ALL_UBICACIONES = "__all__"

export function ActivoCatalogoPage() {
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_TIPOS)
  const [ubicacionId, setUbicacionId] = useState<string>(ALL_UBICACIONES)

  const search = usePaginatedSearch({
    resetKey: `${tipoActivoId}-${ubicacionId}`,
  })

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
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
      tipoActivoId: tipoActivoId === ALL_TIPOS ? undefined : tipoActivoId,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  const rawActivos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  const rawTipos = useMemo(
    () => tiposQuery.data?.content ?? [],
    [tiposQuery.data?.content],
  )

  const tiposById = useMemo(
    () => new Map(rawTipos.map((t) => [t.id, t])),
    [rawTipos],
  )

  const rawUbicaciones = useMemo(
    () => ubicacionesQuery.data?.content ?? [],
    [ubicacionesQuery.data?.content],
  )

  const ubicacionesById = useMemo(
    () => new Map(rawUbicaciones.map((u) => [u.id, u])),
    [rawUbicaciones],
  )

  // Filter client-side by location if chosen
  const activos = useMemo(() => {
    if (ubicacionId === ALL_UBICACIONES) return rawActivos
    return rawActivos.filter((a) => a.ubicacionId === ubicacionId)
  }, [rawActivos, ubicacionId])

  function resetFilters() {
    search.setSearch("")
    setTipoActivoId(ALL_TIPOS)
    setUbicacionId(ALL_UBICACIONES)
    search.setPage(0)
  }

  const hasActiveFilters =
    search.search.trim().length > 0 ||
    tipoActivoId !== ALL_TIPOS ||
    ubicacionId !== ALL_UBICACIONES

  return (
    <PageShell size="xl" layout="fill" padding="compact">
      {/* Header Banner */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="size-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                Catálogo Visual de Activos
              </h1>
              <p className="text-xs text-muted-foreground">
                Galería completa de fichas técnicas, especificaciones y estado operativo.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            render={<Link to={routes.activos.nuevo} />}
            className="shrink-0 self-start sm:self-auto shadow-xs font-medium"
          >
            <Plus className="size-3.5" />
            Registrar Activo
          </Button>
        </div>

        {/* Catalog Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <SearchField
              value={search.search}
              onChange={search.setSearch}
              placeholder="Buscar activo por código, nombre o descripción..."
              className="flex-1"
            />

            {/* Type selector */}
            <Select
              value={tipoActivoId}
              onValueChange={(val) => {
                setTipoActivoId(val ?? ALL_TIPOS)
                search.setPage(0)
              }}
            >
              <SelectTrigger className="w-full sm:w-52 h-8.5 text-xs">
                <Tag className="size-3.5 text-muted-foreground mr-1.5" />
                <SelectValue placeholder="Tipo de activo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TIPOS}>Todos los tipos</SelectItem>
                {rawTipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location selector */}
            <Select
              value={ubicacionId}
              onValueChange={(val) => {
                setUbicacionId(val ?? ALL_UBICACIONES)
                search.setPage(0)
              }}
            >
              <SelectTrigger className="w-full sm:w-52 h-8.5 text-xs">
                <MapPin className="size-3.5 text-muted-foreground mr-1.5" />
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_UBICACIONES}>Todas las ubicaciones</SelectItem>
                {rawUbicaciones.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre}
                  </SelectItem>
                ))}
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

      {/* Catalog Grid Area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-3">
        {activosQuery.isLoading ? (
          <ListSkeleton
            rows={8}
            rowClassName="h-36 rounded-2xl"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
        ) : activosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(activosQuery.error)}
            className="text-destructive my-auto"
          />
        ) : activos.length === 0 ? (
          <EmptyState
            icon={<Package className="size-8 text-muted-foreground/60" />}
            title={
              hasActiveFilters
                ? "Sin resultados para el catálogo"
                : "Catálogo vacío"
            }
            description={
              hasActiveFilters
                ? "Prueba a modificar los términos de búsqueda o cambiar los filtros seleccionados."
                : "Aún no se han registrado activos en el sistema."
            }
            action={
              hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  <RotateCcw className="size-4" />
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" render={<Link to={routes.activos.nuevo} />}>
                  <Plus className="size-4" />
                  Registrar Activo
                </Button>
              )
            }
            className="my-auto"
          />
        ) : (
          <>
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pr-1",
                activosQuery.isFetching && "opacity-75 transition-opacity",
              )}
            >
              <ul className="grid grid-cols-1 content-start gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {activos.map((activo) => (
                  <ActivoCard
                    key={activo.id}
                    activo={activo}
                    tipoActivo={tiposById.get(activo.tipoActivoId)}
                    ubicacion={
                      activo.ubicacionId
                        ? ubicacionesById.get(activo.ubicacionId)
                        : undefined
                    }
                    onEdit={() => {}}
                  />
                ))}
              </ul>
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
