import {
  CheckCircle2,
  FolderTree,
  HelpCircle,
  Layers,
  ListOrdered,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type CategoriaHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriaHelpModal({
  open,
  onOpenChange,
}: CategoriaHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Parametrización: Categorías de Activos
            </DialogTitle>
          </div>
          <DialogDescription>
            Recomendaciones para organizar y catalogar las categorías de bienes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Propósito */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <FolderTree className="size-4" />
              <h4>¿Para qué sirven las Categorías?</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Las categorías representan la clasificación contable y operativa de primer nivel en el inventario. Permiten segmentar tipos de activos, agrupar reportes de depreciación y filtrar consultas masivas.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                COMPUTO
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                VEHICULOS
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                MAQUINARIA
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                MOBILIARIO
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                INMUEBLES
              </span>
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ListOrdered className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h4>Orden de Visualización</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El número de orden define la prioridad al desplegar listas desplegables, selectores en formularios de activos y filtros rápidos. Puedes ajustar el número de orden editando la categoría.
            </p>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5" />
              Buenas Prácticas
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Mantén códigos estandarizados en mayúsculas sin caracteres especiales (ej. <strong>MOB_OFICINA</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Define descripciones claras para que los custodios y administradores asignen la categoría correcta al dar de alta activos.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
