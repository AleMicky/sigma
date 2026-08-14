import { BookOpen, CheckCircle2, Copy, Hash, HelpCircle, Lightbulb, ListFilter } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Separator } from "@/shared/components/ui/separator"

type CatalogoHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CatalogoHelpModal({ open, onOpenChange }: CatalogoHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <HelpCircle className="size-5" />
            </div>
            <DialogTitle className="text-xl">
              Guía de Catálogos de Parámetros
            </DialogTitle>
          </div>
          <DialogDescription>
            Aprende cómo están estructurados los catálogos del sistema y las mejores prácticas para definir códigos y valores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Concepto Principal */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-primary mb-1">
              <BookOpen className="size-4" />
              ¿Qué es un Catálogo Maestro?
            </div>
            <p className="text-muted-foreground">
              Un <strong>Catálogo Maestro</strong> agrupa un conjunto de opciones o valores dinámicos que se utilizan en los desplegables del sistema (ej. <em>Tipo de Documento</em>, <em>Estado de Activo</em>, <em>Monedas</em>). Permite administrar listas de valores sin modificar código de aplicación.
            </p>
          </div>

          {/* Formatos recomendados */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Hash className="size-4 text-primary" />
              Convención de Códigos y Valores
            </h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>Código del Catálogo</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-primary">
                    TIPO_DOCUMENTO
                  </code>
                </div>
                <p className="text-muted-foreground">
                  Se recomienda usar formato <strong>UPPERCASE_SNAKE_CASE</strong>. Este código identifica unívocamente al grupo de parámetros.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>Valor de Ítem</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                    CI / PASAPORTE
                  </code>
                </div>
                <p className="text-muted-foreground">
                  El valor que se almacena internamente en la base de datos. Debe ser corto y único dentro del catálogo.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ordenamiento e ítems */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <ListFilter className="size-4 text-primary" />
              Ordenamiento de Ítems (<code className="text-xs">orden</code>)
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cada ítem hijo de un catálogo incluye un número de orden. Los desplegables en la aplicación presentan las opciones ordenadas en forma ascendente según este valor.
            </p>

            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Creación automática:</strong> Al agregar un valor sin especificar orden, el sistema le asignará el siguiente número disponible.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Reordenamiento:</strong> Puedes editar cualquier ítem para ajustar su posición relativa en la lista.
                </span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Utilidades de copia */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Lightbulb className="size-4 text-amber-500 shrink-0" />
              Consejo Pro: Copia Rápida de Códigos
            </div>
            <p className="text-muted-foreground">
              Al pasar el cursor sobre los códigos de catálogos o valores de ítems, verás el botón de copia rápida <Copy className="inline size-3.5 text-muted-foreground" />. Al hacer clic, se copiará el identificador al portapapeles con una notificación flotante.
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
