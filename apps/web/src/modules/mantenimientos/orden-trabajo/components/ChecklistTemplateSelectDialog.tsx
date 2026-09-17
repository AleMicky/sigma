import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  FileSpreadsheet,
  Layers,
  ListChecks,
  Loader2,
  Plus,
  Wrench,
} from "lucide-react"

import { actividadAplicacionQueries } from "@/modules/mantenimientos/actividad/api/actividad-aplicacion.queries"
import { checklistItemQueries } from "@/modules/mantenimientos/actividad/api/checklist-item.queries"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

import { ActividadMantenimientoCombobox } from "./ActividadMantenimientoCombobox"

export type ImportedChecklistItem = {
  actividadMantenimientoId: string | null
  descripcion: string
  observacion?: string
}

type ChecklistTemplateSelectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoActivoId?: string | null
  tipoActivoNombre?: string | null
  onImport: (items: ImportedChecklistItem[]) => void
}

export function ChecklistTemplateSelectDialog({
  open,
  onOpenChange,
  tipoActivoId,
  tipoActivoNombre,
  onImport,
}: ChecklistTemplateSelectDialogProps) {
  const [selectedActividadId, setSelectedActividadId] = useState<string>("")
  const [selectedAplicacionId, setSelectedAplicacionId] = useState<string>("")
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())

  // Consulta de aplicaciones para la actividad seleccionada
  const aplicacionesQuery = useQuery({
    ...actividadAplicacionQueries.byActividad(selectedActividadId, { size: 100 }),
    enabled: open && Boolean(selectedActividadId),
  })
  const aplicaciones = aplicacionesQuery.data?.content ?? []

  // Auto-seleccionar aplicación si coincide con el tipo de activo o si solo hay una
  const activeAplicacion = useMemo(() => {
    if (!selectedAplicacionId && aplicaciones.length > 0) {
      if (tipoActivoId) {
        const matching = aplicaciones.find(
          (ap) => ap.tipoActivo?.id === tipoActivoId,
        )
        if (matching) return matching
      }
      return aplicaciones[0]
    }
    return aplicaciones.find((ap) => ap.id === selectedAplicacionId) ?? null
  }, [aplicaciones, selectedAplicacionId, tipoActivoId])

  const effectiveAplicacionId = activeAplicacion?.id || selectedAplicacionId

  // Consulta de los ítems de checklist ordenados usando el endpoint dedicado:
  // GET /api/v1/checklist-items/aplicacion/{actividadMantenimientoAplicacionId}
  const checklistItemsQuery = useQuery({
    ...checklistItemQueries.byAplicacionList(effectiveAplicacionId),
    enabled: open && Boolean(effectiveAplicacionId),
  })

  const checklistItems = checklistItemsQuery.data ?? []

  // Auto-seleccionar todos los ítems cuando se cargan nuevos ítems
  const handleSelectAll = () => {
    if (selectedItemIds.size === checklistItems.length) {
      setSelectedItemIds(new Set())
    } else {
      setSelectedItemIds(new Set(checklistItems.map((item) => item.id)))
    }
  }

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleActividadChange = (actId: string) => {
    setSelectedActividadId(actId)
    setSelectedAplicacionId("")
    setSelectedItemIds(new Set())
  }

  const handleAplicacionChange = (apId: string) => {
    setSelectedAplicacionId(apId)
    setSelectedItemIds(new Set())
  }

  const handleImportSubmit = () => {
    const selected = checklistItems.filter(
      (item) => selectedItemIds.size === 0 || selectedItemIds.has(item.id),
    )

    const mapped: ImportedChecklistItem[] = selected.map((item) => ({
      actividadMantenimientoId: selectedActividadId || null,
      descripcion: item.nombre,
      observacion: item.descripcion || "",
    }))

    onImport(mapped)
    onOpenChange(false)
  }

  const isAllSelected =
    checklistItems.length > 0 &&
    (selectedItemIds.size === checklistItems.length || selectedItemIds.size === 0)

  const selectedCount =
    selectedItemIds.size === 0 ? checklistItems.length : selectedItemIds.size

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl shadow-xl border-border/60">
        <DialogHeader className="px-3.5 py-2 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex size-6.5 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 shrink-0">
              <ListChecks className="size-3.5" />
            </div>
            <div>
              <DialogTitle className="text-xs sm:text-sm font-bold leading-tight">
                Importar Checklist / Plantilla
              </DialogTitle>
              <DialogDescription className="text-[10.5px] text-muted-foreground leading-tight">
                Selecciona la actividad para cargar sus tareas predefinidas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2.5 min-h-0 text-xs">
          {/* Fila compacta de configuración: Actividad y Perfil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 rounded-xl border bg-muted/10">
            {/* Actividad */}
            <div className="space-y-0.5">
              <Label className="text-[10.5px] font-semibold flex items-center gap-1 text-foreground">
                <Wrench className="size-2.5 text-primary" />
                <span>Actividad del Catálogo *</span>
              </Label>
              <ActividadMantenimientoCombobox
                value={selectedActividadId}
                onValueChange={(val) => handleActividadChange(val)}
                placeholder="Buscar actividad..."
                className="h-7.5 text-xs bg-background"
              />
            </div>

            {/* Aplicación / Perfil */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10.5px] font-semibold flex items-center gap-1 text-foreground">
                  <Layers className="size-2.5 text-primary" />
                  <span>Perfil / Tipo Activo</span>
                </Label>
                {tipoActivoNombre && (
                  <span className="text-[9.5px] text-muted-foreground truncate max-w-[100px]" title={tipoActivoNombre}>
                    {tipoActivoNombre}
                  </span>
                )}
              </div>

              {!selectedActividadId ? (
                <div className="h-7.5 flex items-center px-2 text-[11px] text-muted-foreground/60 border rounded-lg bg-background">
                  Elige una actividad...
                </div>
              ) : aplicacionesQuery.isLoading ? (
                <div className="h-7.5 flex items-center gap-1.5 px-2 text-[11px] text-muted-foreground border rounded-lg bg-background">
                  <Loader2 className="size-2.5 animate-spin text-primary" />
                  <span>Cargando...</span>
                </div>
              ) : aplicaciones.length === 0 ? (
                <div className="h-7.5 flex items-center px-2 text-[11px] text-muted-foreground italic border rounded-lg bg-background">
                  Sin perfiles
                </div>
              ) : (
                <div className="flex gap-1 overflow-x-auto py-0.5 scrollbar-none">
                  {aplicaciones.map((ap) => {
                    const isSelected = ap.id === effectiveAplicacionId
                    return (
                      <button
                        key={ap.id}
                        type="button"
                        onClick={() => handleAplicacionChange(ap.id)}
                        className={cn(
                          "h-6.5 px-2 rounded-md border text-[11px] font-semibold shrink-0 transition-all cursor-pointer truncate max-w-[140px]",
                          isSelected
                            ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                            : "bg-background border-border text-foreground hover:bg-muted",
                        )}
                        title={ap.tipoActivo?.nombre || "General"}
                      >
                        {ap.tipoActivo?.nombre || "General"}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Vista Previa de Ítems del Checklist */}
          {effectiveAplicacionId ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 px-0.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                  <FileSpreadsheet className="size-3 text-primary" />
                  <span>Tareas ({checklistItems.length})</span>
                </div>

                {checklistItems.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-5 px-1.5 text-[10px] font-semibold text-primary hover:text-primary/80 cursor-pointer"
                  >
                    {isAllSelected ? "Deseleccionar todo" : "Seleccionar todo"}
                  </Button>
                )}
              </div>

              {checklistItemsQuery.isLoading ? (
                <div className="flex items-center justify-center py-4 gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Cargando tareas...</span>
                </div>
              ) : checklistItems.length === 0 ? (
                <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground bg-muted/5">
                  No hay tareas registradas en el checklist.
                </div>
              ) : (
                <div className="rounded-xl border divide-y overflow-hidden max-h-48 overflow-y-auto bg-card shadow-2xs">
                  {checklistItems.map((item, idx) => {
                    const isChecked =
                      selectedItemIds.size === 0 || selectedItemIds.has(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "py-1.5 px-2.5 text-xs flex items-center gap-2 transition-colors cursor-pointer select-none",
                          isChecked
                            ? "bg-sky-500/5 hover:bg-sky-500/10"
                            : "opacity-45 hover:opacity-100",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors",
                            isChecked
                              ? "bg-sky-600 border-sky-600 text-white"
                              : "border-muted-foreground/40 bg-background",
                          )}
                        >
                          {isChecked && <Check className="size-2.5 stroke-[3]" />}
                        </div>

                        <span className="font-mono text-[9.5px] font-bold text-muted-foreground w-4 shrink-0">
                          #{item.orden || idx + 1}
                        </span>

                        <div className="min-w-0 flex-1 leading-tight">
                          <span className="font-semibold text-foreground truncate block text-xs">
                            {item.nombre}
                          </span>
                          {item.descripcion && (
                            <span className="text-[10px] text-muted-foreground truncate block">
                              {item.descripcion}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 text-center text-[11px] text-muted-foreground border border-dashed rounded-xl bg-muted/5">
              Selecciona una actividad para ver e importar sus tareas.
            </div>
          )}
        </div>

        <DialogFooter className="px-3.5 py-2 border-t bg-muted/20 flex flex-row items-center justify-between gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7 px-3 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={checklistItems.length === 0}
            onClick={handleImportSubmit}
            className="h-7 px-3 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Importar {selectedCount} Tareas</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
