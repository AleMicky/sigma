import { Link } from "@tanstack/react-router"
import { ArrowRight, Edit2, Layers, Sliders, Tags } from "lucide-react"

import { routes } from "@/app/config/routes"
import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import type { TipoActivo } from "../api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "../lib/tipo-activo-colors"
import { getTipoActivoIcon } from "../lib/tipo-activo-icons"

type TipoActivoQuickViewSheetProps = {
  tipoActivo: TipoActivo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  categoriaNombre?: string | null
  onEdit: (tipoActivo: TipoActivo) => void
}

export function TipoActivoQuickViewSheet({
  tipoActivo,
  open,
  onOpenChange,
  categoriaNombre,
  onEdit,
}: TipoActivoQuickViewSheetProps) {
  if (!tipoActivo) return null

  const Icon = getTipoActivoIcon(tipoActivo.icono)
  const color = tipoActivo.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
          {/* Header Banner */}
          <div
            className="relative px-6 pt-8 pb-6 flex flex-col items-start gap-4 border-b"
            style={{
              background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            }}
          >
            <div className="flex items-center gap-4">
              <span
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
              >
                <Icon className="size-7" />
              </span>
              <div className="flex flex-col min-w-0">
                {categoriaNombre ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-background/80 text-foreground border border-border/60 w-fit mb-1">
                    <Tags className="size-3 text-muted-foreground" />
                    {categoriaNombre}
                  </span>
                ) : null}
                <SheetTitle className="text-xl font-bold truncate">
                  {tipoActivo.nombre}
                </SheetTitle>
              </div>
            </div>
          </div>

          <SheetHeader className="px-6 pt-4 pb-2">
            <SheetDescription className="text-sm text-foreground/80 leading-relaxed">
              {tipoActivo.descripcion || "Sin descripción proporcionada."}
            </SheetDescription>
          </SheetHeader>

          {/* Quick Actions List */}
          <div className="px-6 py-4 flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navegación Rápida
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to={routes.tiposActivo.atributos(tipoActivo.id)}
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:bg-accent/50 hover:border-primary/40 transition-all group"
                onClick={() => onOpenChange(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Sliders className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Configurar Atributos</span>
                    <span className="text-xs text-muted-foreground">Campos y especificaciones</span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to={routes.tiposActivo.componentes(tipoActivo.id)}
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:bg-accent/50 hover:border-primary/40 transition-all group"
                onClick={() => onOpenChange(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Layers className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Gestionar Componentes</span>
                    <span className="text-xs text-muted-foreground">Sub-partes y consumibles</span>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Details & Metadata */}
          <div className="px-6 py-4 mt-auto border-t bg-muted/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Información de Registro
            </h4>
            <AuditInfo data={tipoActivo} />
          </div>
        </div>

        <SheetFooter className="p-4 border-t bg-card flex-row gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(tipoActivo)
            }}
            className="flex-1"
          >
            <Edit2 className="size-4" />
            Editar Tipo
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
