import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  CheckSquare,
  FileSpreadsheet,
  Layers,
  ListChecks,
  Loader2,
  Plus,
  Wrench,
} from "lucide-react"

import { actividadQueries } from "@/modules/mantenimientos/actividad/api/actividad.queries"
import { actividadAplicacionQueries } from "@/modules/mantenimientos/actividad/api/actividad-aplicacion.queries"
import { checklistItemQueries } from "@/modules/mantenimientos/actividad/api/checklist-item.queries"
import type { ChecklistItem } from "@/modules/mantenimientos/actividad/api/checklist-item.service"
import { Badge } from "@/shared/components/ui/badge"
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

  // Consulta de actividades del catálogo
  const actividadesQuery = useQuery({
    ...actividadQueries.list({ size: 100, sortBy: "codigo", direction: "ASC" }),
    enabled: open,
  })
  const actividades = actividadesQuery.data?.content ?? []

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

  // Al cambiar la actividad o aplicación, pre-seleccionar todos por defecto
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25">
              <ListChecks className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Cargar Actividades desde Plantilla / Checklist
              </DialogTitle>
              <DialogDescription className="text-xs">
                Selecciona una actividad y su perfil de aplicación para importar automáticamente las tareas planificadas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
          {/* Paso 1: Selección de Actividad */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Wrench className="size-3.5 text-primary" />
              <span>1. Seleccionar Actividad de Mantenimiento</span>
            </Label>
            {actividadesQuery.isLoading ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                <span>Cargando catálogo de actividades...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border rounded-xl bg-muted/10">
                {actividades.map((act) => {
                  const isSelected = act.id === selectedActividadId
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleActividadChange(act.id)}
                      className={cn(
                        "flex items-center justify-between gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer select-none",
                        isSelected
                          ? "bg-sky-500/15 border-sky-500 text-sky-950 dark:text-sky-100 font-bold shadow-2xs"
                          : "bg-card border-border/80 text-foreground hover:bg-muted/50",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded border border-border/60 shrink-0">
                            {act.codigo}
                          </span>
                          <span className="truncate font-medium">{act.nombre}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="size-3.5 text-sky-600 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Paso 2: Selección de Aplicación / Perfil */}
          {selectedActividadId && (
            <div className="space-y-1.5 pt-1 border-t">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Layers className="size-3.5 text-primary" />
                  <span>2. Perfil de Aplicación</span>
                </Label>
                {tipoActivoNombre && (
                  <span className="text-[11px] text-muted-foreground">
                    Activo actual: <strong className="text-foreground font-semibold">{tipoActivoNombre}</strong>
                  </span>
                )}
              </div>

              {aplicacionesQuery.isLoading ? (
                <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Cargando aplicaciones de la actividad...</span>
                </div>
              ) : aplicaciones.length === 0 ? (
                <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground bg-muted/10">
                  Esta actividad no tiene perfiles de aplicación o checklists configurados en el catálogo.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {aplicaciones.map((ap) => {
                    const isSelected = ap.id === effectiveAplicacionId
                    return (
                      <button
                        key={ap.id}
                        type="button"
                        onClick={() => handleAplicacionChange(ap.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-sky-600 text-white font-bold border-sky-600 shadow-xs"
                            : "bg-card border-border/80 text-foreground hover:bg-muted/50",
                        )}
                      >
                        <span>{ap.tipoActivo?.nombre || "Aplicación General"}</span>
                        {ap.componente && (
                          <span className={cn("text-[10px] px-1 py-0.2 rounded", isSelected ? "bg-white/20" : "bg-muted")}>
                            {ap.componente.nombre}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Vista Previa de Ítems del Checklist */}
          {effectiveAplicacionId && (
            <div className="space-y-2 pt-1 border-t">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <FileSpreadsheet className="size-3.5 text-primary" />
                  <Label className="text-xs font-semibold text-foreground">
                    3. Ítems de Checklist Disponibles ({checklistItems.length})
                  </Label>
                </div>

                {checklistItems.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-6 px-2 text-[11px] font-semibold text-primary hover:text-primary/80 cursor-pointer"
                  >
                    {isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                  </Button>
                )}
              </div>

              {checklistItemsQuery.isLoading ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>Obteniendo ítems del checklist ordenados...</span>
                </div>
              ) : checklistItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground bg-muted/10">
                  No hay ítems registrados en el checklist de esta aplicación.
                </div>
              ) : (
                <div className="rounded-xl border divide-y overflow-hidden max-h-56 overflow-y-auto bg-card shadow-2xs">
                  {checklistItems.map((item, idx) => {
                    const isChecked =
                      selectedItemIds.size === 0 || selectedItemIds.has(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "p-2.5 text-xs flex items-start gap-2.5 transition-colors cursor-pointer select-none",
                          isChecked
                            ? "bg-sky-500/5 hover:bg-sky-500/10"
                            : "opacity-60 hover:opacity-100",
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors mt-0.5",
                            isChecked
                              ? "bg-sky-600 border-sky-600 text-white"
                              : "border-muted-foreground/40 bg-background",
                          )}
                        >
                          {isChecked && <Check className="size-3 stroke-[3]" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-muted-foreground">
                              #{item.orden || idx + 1}
                            </span>
                            <span className="font-semibold text-foreground">
                              {item.nombre}
                            </span>
                          </div>
                          {item.descripcion && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                              {item.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-3 sm:px-5 sm:py-3 border-t bg-muted/20 flex flex-row items-center justify-between gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={checklistItems.length === 0}
            onClick={handleImportSubmit}
            className="h-8 gap-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>
              Importar {selectedItemIds.size === 0 ? checklistItems.length : selectedItemIds.size} Tareas
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
