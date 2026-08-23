import {
  BookOpen,
  CheckCircle2,
  Copy,
  Hash,
  HelpCircle,
  Lightbulb,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Separator } from "@/shared/components/ui/separator"

type TipoInsumoHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TipoInsumoHelpModal({
  open,
  onOpenChange,
}: TipoInsumoHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <HelpCircle className="size-5" />
            </div>
            <DialogTitle className="text-xl">
              Guía de Tipos de Insumo y Atributos Dinámicos
            </DialogTitle>
          </div>
          <DialogDescription>
            Aprende cómo clasificar insumos y definir atributos personalizados dinámicos para capturar especificaciones técnicas en tu inventario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-primary mb-1">
              <BookOpen className="size-4" />
              ¿Qué es un Tipo de Insumo?
            </div>
            <p className="text-muted-foreground">
              Un <strong>Tipo de Insumo</strong> clasifica los insumos, materiales y repuestos del inventario (ej. <em>Repuestos Mecánicos</em>, <em>Fluidos y Lubricantes</em>, <em>Equipos de Protección</em>). Sirve como plantilla técnica para definir qué atributos o características deben capturarse al registrar un insumo.
            </p>
          </div>

          {/* Atributos Dinámicos */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <SlidersHorizontal className="size-4 text-primary" />
              ¿Qué son los Atributos Dinámicos?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Son campos personalizados asignados a cada tipo de insumo. Permiten extender el inventario con información técnica específica sin alterar la estructura fija del sistema:
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-3 text-xs space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500" />
                  Lubricantes / Fluidos
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Atributos: <code>VISCOSIDAD</code> (Texto/Lista), <code>PUNTO_INFLAMACION</code> (Numérico), <code>BASE_QUIMICA</code>.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-3 text-xs space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber-500" />
                  Repuestos Eléctricos
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Atributos: <code>VOLTAJE_OPERACION</code> (Numérico), <code>AMPERAJE</code>, <code>TIPO_CONECTOR</code>.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Convención de Códigos */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Hash className="size-4 text-primary" />
              Convención de Códigos
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>Código del Tipo</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-primary">
                    REPUESTO_MECANICO
                  </code>
                </div>
                <p className="text-muted-foreground">
                  Identificador alfanumérico único para la clasificación en formato <strong>UPPERCASE_SNAKE_CASE</strong>.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>Código del Atributo</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                    DIAMETRO_NOMINAL
                  </code>
                </div>
                <p className="text-muted-foreground">
                  Identificador técnico único por tipo de insumo usado para almacenar el valor correspondiente en la base de datos.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Beneficios e impacto */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Sparkles className="size-4 text-primary" />
              Impacto en la Gestión de Inventarios
            </h4>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Formularios Dinámicos:</strong> Al crear un nuevo Insumo en el catálogo y seleccionar su Tipo, se renderizarán automáticamente todos los campos configurados aquí.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Validaciones Automáticas:</strong> Los atributos marcados como <em>Obligatorio</em> serán exigidos al usuario antes de guardar el insumo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Filtros y Búsquedas Avanzadas:</strong> Permite consultar insumos por sus especificaciones técnicas de manera granular.
                </span>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Lightbulb className="size-4 text-amber-500 shrink-0" />
              Consejo Pro: Copia Rápida
            </div>
            <p className="text-muted-foreground">
              Puedes copiar rápidamente cualquier código de tipo de insumo haciendo clic en el icono <Copy className="inline size-3.5 text-muted-foreground" /> presente en las listas y encabezados.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
