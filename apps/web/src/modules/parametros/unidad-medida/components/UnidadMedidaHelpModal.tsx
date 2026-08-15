import { Calculator, CheckCircle2, Hash, HelpCircle, Ruler } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type UnidadMedidaHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnidadMedidaHelpModal({
  open,
  onOpenChange,
}: UnidadMedidaHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Unidades de Medida
            </DialogTitle>
          </div>
          <DialogDescription>
            Recomendaciones para estandarizar las unidades de medida en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Categoría Decimales */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
              <Calculator className="size-4" />
              <h4>Unidades Continuas (Permite Decimales = Sí)</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Utilízala para magnitudes físicas continuas como masa, longitud, volumen, tiempo o área. Permite ingresar valores con punto o coma decimal.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                KG (kg)
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                M (m)
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                L (L)
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                HORA (h)
              </span>
            </div>
          </div>

          {/* Categoría Enteros */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold">
              <Hash className="size-4" />
              <h4>Unidades Discretas (Permite Decimales = No)</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ideal para bienes contables indivisibles, como unidades fisicas, juegos, paquetes o cajas. El sistema validará que los conteos sean enteros exactos.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-mono font-medium text-indigo-800 dark:text-indigo-200">
                PZA (pza)
              </span>
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-mono font-medium text-indigo-800 dark:text-indigo-200">
                UNID (unid)
              </span>
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-mono font-medium text-indigo-800 dark:text-indigo-200">
                CAJA (caja)
              </span>
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-mono font-medium text-indigo-800 dark:text-indigo-200">
                KIT (kit)
              </span>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Ruler className="size-3.5" />
              Buenas prácticas de código y símbolo
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Usa códigos breves y mayúsculas sostenidas (ej. <strong>KG</strong>, <strong>PZA</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Utiliza los símbolos estándar del Sistema Internacional (SI) o convenciones de la organización.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
