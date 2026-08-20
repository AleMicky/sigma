import { X } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { SearchField } from "@/shared/components/search-field"
import { cn } from "@/shared/lib/utils"

type SolicitudFilterToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  statusValue: string
  onStatusChange: (status: string) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

const ESTADOS = [
  { value: "all", label: "Todos los estados", dot: "bg-muted-foreground/50" },
  { value: "borrador", label: "Borrador", dot: "bg-zinc-400" },
  { value: "solicitado", label: "Solicitado", dot: "bg-amber-500" },
  { value: "aprobado", label: "Aprobado", dot: "bg-sky-500" },
  { value: "en_proceso", label: "En Proceso", dot: "bg-blue-500" },
  { value: "finalizado", label: "Finalizado", dot: "bg-emerald-500" },
  { value: "rechazado", label: "Rechazado", dot: "bg-rose-500" },
]

export function SolicitudFilterToolbar({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  hasActiveFilters,
  onResetFilters,
}: SolicitudFilterToolbarProps) {
  const currentStatusObj = ESTADOS.find(
    (e) => e.value === (statusValue || "all"),
  )

  return (
    <div className="flex flex-col gap-2.5 pt-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
      {/* Search & Status Filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="w-full sm:w-72">
          <SearchField
            placeholder="Buscar por título, número, activo..."
            value={searchValue}
            onChange={onSearchChange}
            className="w-full h-9 text-xs"
          />
        </div>

        <div className="w-44">
          <Select
            value={statusValue || "all"}
            onValueChange={(val) =>
              onStatusChange(val === "all" ? "" : (val ?? ""))
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Estado">
                {currentStatusObj ? (
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "size-2 rounded-full shrink-0 inline-block",
                        currentStatusObj.dot,
                      )}
                    />
                    <span className="truncate">{currentStatusObj.label}</span>
                  </div>
                ) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {ESTADOS.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className="text-xs cursor-pointer py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("size-2 rounded-full shrink-0", item.dot)}
                    />
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters ? (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={onResetFilters}
            className="h-9 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            <X className="size-3.5" />
            <span>Limpiar filtros</span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
