import { ArrowDownWideNarrow, ArrowUpNarrowWide, ArrowUpDown, X } from "lucide-react"

import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"

export interface SolicitudFilterToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedEstado?: string
  selectedEstadoLabel?: string
  onClearEstado?: () => void
  sortBy?: string
  onSortByChange?: (value: string) => void
  direction?: "ASC" | "DESC"
  onDirectionChange?: (value: "ASC" | "DESC") => void
  placeholder?: string
  className?: string
}

export function SolicitudFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedEstado,
  selectedEstadoLabel,
  onClearEstado,
  sortBy = "createdAt",
  onSortByChange,
  direction = "DESC",
  onDirectionChange,
  placeholder = "Buscar por número, título, activo o solicitante…",
  className,
}: SolicitudFilterToolbarProps) {
  const isDesc = direction === "DESC"

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <SearchField
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={placeholder}
        className="w-full max-w-sm sm:max-w-md shadow-2xs"
      />

      <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
        {selectedEstado && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in-50 duration-200">
            <span className="text-[11px] font-medium">Filtrado por:</span>
            <Badge
              variant="secondary"
              className="gap-1.5 pl-2.5 pr-1.5 py-0.5 text-xs font-semibold capitalize bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15 transition-all shadow-2xs"
            >
              <span>{selectedEstadoLabel ?? selectedEstado.replace(/_/g, " ")}</span>
              {onClearEstado && (
                <button
                  type="button"
                  onClick={onClearEstado}
                  className="flex size-3.5 items-center justify-center rounded-full hover:bg-primary/20 text-primary/80 hover:text-primary cursor-pointer transition-colors"
                  title="Quitar filtro de estado"
                >
                  <X className="size-2.5" />
                  <span className="sr-only">Quitar filtro</span>
                </button>
              )}
            </Badge>
          </div>
        )}

        {/* Controles de ordenación (SortBy + Dirección ASC/DESC) */}
        {onDirectionChange && (
          <div className="flex items-center gap-1.5 shrink-0">
            {onSortByChange && (
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  if (val) onSortByChange(val)
                }}
              >
                <SelectTrigger
                  className="h-8 text-xs w-[145px] sm:w-[155px] shadow-2xs bg-background"
                  aria-label="Criterio de ordenación"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown className="size-3 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Ordenar por" />
                  </div>
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="createdAt">Fecha de registro</SelectItem>
                  <SelectItem value="fechaSolicitud">Fecha de solicitud</SelectItem>
                  <SelectItem value="numero">N° de solicitud</SelectItem>
                  <SelectItem value="titulo">Título</SelectItem>
                  <SelectItem value="estado">Estado</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDirectionChange(isDesc ? "ASC" : "DESC")}
              className="h-8 px-2.5 text-xs font-medium gap-1.5 shadow-2xs bg-background hover:bg-muted/80 cursor-pointer"
              title={
                isDesc
                  ? "Orden descendente (más recientes primero). Clic para ordenar ascendente."
                  : "Orden ascendente (más antiguos primero). Clic para ordenar descendente."
              }
            >
              {isDesc ? (
                <>
                  <ArrowDownWideNarrow className="size-3.5 text-primary shrink-0" />
                  <span>Desc</span>
                </>
              ) : (
                <>
                  <ArrowUpNarrowWide className="size-3.5 text-primary shrink-0" />
                  <span>Asc</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

