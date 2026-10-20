import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  FileSpreadsheet,
  Loader2,
  Search,
  X,
} from "lucide-react"

import { categoriaQueries } from "@/modules/activos/categoria/api/categoria.queries"
import { estadoOperativoQueries } from "@/modules/activos/estado-operativo/api/estado-operativo.queries"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export interface DisponibilidadFiltrosBarProps {
  search: string
  onSearchChange: (search: string) => void
  estadoOperativoId?: string | null
  onEstadoOperativoChange: (id: string | null) => void
  categoriaId?: string | null
  onCategoriaChange: (id: string | null) => void
  tipoActivoId?: string | null
  onTipoActivoChange: (id: string | null) => void
  ubicacionId?: string | null
  onUbicacionChange: (id: string | null) => void
  activoFilter?: boolean | null
  onActivoFilterChange: (active: boolean | null) => void
  onLimpiarFiltros: () => void
  onExportarExcel: () => void
  isExportingExcel?: boolean
}

export function DisponibilidadFiltrosBar({
  search,
  onSearchChange,
  estadoOperativoId,
  onEstadoOperativoChange,
  categoriaId,
  onCategoriaChange,
  tipoActivoId,
  onTipoActivoChange,
  ubicacionId,
  onUbicacionChange,
  activoFilter,
  onActivoFilterChange,
  onLimpiarFiltros,
  onExportarExcel,
  isExportingExcel = false,
}: Readonly<DisponibilidadFiltrosBarProps>) {
  // Consultas de catálogos para los selectores
  const estadosQuery = useQuery(
    estadoOperativoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const estados = estadosQuery.data?.content ?? []

  const categoriasQuery = useQuery(
    categoriaQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const categorias = categoriasQuery.data?.content ?? []

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const allTipos = tiposQuery.data?.content ?? []
  const tipos = categoriaId
    ? allTipos.filter((t) => t.categoriaId === categoriaId)
    : allTipos

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const ubicaciones = ubicacionesQuery.data?.content ?? []

  const hasActiveFilters = Boolean(
    search ||
      estadoOperativoId ||
      categoriaId ||
      tipoActivoId ||
      ubicacionId ||
      activoFilter != null,
  )

  return (
    <Card className="border-border/60 shadow-xs print:hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Encabezado de barra de filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Filtros de Disponibilidad y Estado Operativo
              </h2>
              <p className="text-xs text-muted-foreground">
                Consulte y segmente activos por estado técnico, categoría, tipología y ubicación física
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLimpiarFiltros}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar filtros
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onExportarExcel}
              disabled={isExportingExcel}
              className="h-8 text-xs font-medium border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5"
            >
              {isExportingExcel ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {isExportingExcel ? "Generando Excel..." : "Exportar a Excel"}
            </Button>
          </div>
        </div>

        {/* Formulario de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Búsqueda por texto */}
          <div className="space-y-1.5 col-span-1 sm:col-span-2">
            <Label htmlFor="search-activo-disp" className="text-xs font-medium text-foreground">
              Búsqueda rápida
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="search-activo-disp"
                placeholder="Código, nombre o descripción..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Estado Operativo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Estado Operativo
            </Label>
            <Select
              value={estadoOperativoId ?? "TODOS"}
              onValueChange={(val) =>
                onEstadoOperativoChange(val === "TODOS" ? null : val)
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los estados</SelectItem>
                {estados.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: e.color || "#6B7280" }}
                      />
                      <span>{e.nombre}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Categoría
            </Label>
            <Select
              value={categoriaId ?? "TODAS"}
              onValueChange={(val) => {
                onCategoriaChange(val === "TODAS" ? null : val)
                onTipoActivoChange(null) // Reset tipo activo
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las categorías</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Activo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Tipo de Activo
            </Label>
            <Select
              value={tipoActivoId ?? "TODOS"}
              onValueChange={(val) =>
                onTipoActivoChange(val === "TODOS" ? null : val)
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los tipos</SelectItem>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ubicación */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Ubicación
            </Label>
            <Select
              value={ubicacionId ?? "TODAS"}
              onValueChange={(val) =>
                onUbicacionChange(val === "TODAS" ? null : val)
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas las ubicaciones</SelectItem>
                {ubicaciones.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado Registro */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Registro
            </Label>
            <Select
              value={
                activoFilter === null || activoFilter === undefined
                  ? "TODOS"
                  : activoFilter
                    ? "ACTIVO"
                    : "INACTIVO"
              }
              onValueChange={(val) => {
                if (val === "TODOS") onActivoFilterChange(null)
                else if (val === "ACTIVO") onActivoFilterChange(true)
                else onActivoFilterChange(false)
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="ACTIVO">Solo Activos</SelectItem>
                <SelectItem value="INACTIVO">Solo Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
