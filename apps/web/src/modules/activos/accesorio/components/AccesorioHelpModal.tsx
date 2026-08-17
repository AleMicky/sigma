import {
  CheckCircle2,
  FolderTree,
  HelpCircle,
  Paperclip,
  Sparkles,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type AccesorioHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccesorioHelpModal({
  open,
  onOpenChange,
}: AccesorioHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Parametrización: Accesorios de Activos
            </DialogTitle>
          </div>
          <DialogDescription>
            Criterios y buenas prácticas para la configuración de accesorios y complementos por categoría.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Que es un accesorio */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Paperclip className="size-4" />
              <h4>¿Qué es un Accesorio de Activo?</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Son elementos complementarios, periféricos, herramientas o aditamentos que acompañan al activo pero pueden desmontarse o transferirse sin comprometer la integridad estructural del activo principal.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                GPS_TRACKER
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                EXTINTOR_6KG
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                RADIO_VHF
              </span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                BOTIQUIN_PRIMEROS_AUXILIOS
              </span>
            </div>
          </div>

          {/* Vinculación con Categoría */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
              <FolderTree className="size-4" />
              <h4>Asociación por Categoría</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cada accesorio pertenece a una <strong>Categoría</strong> (ej. Vehículos, Equipos de Cómputo, Maquinaria Pesada). Esto permite que al registrar o inspeccionar un activo, se reconozcan los accesorios compatibles según su categoría.
            </p>
          </div>

          {/* Recomendaciones */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Recomendaciones de Estandarización
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Utiliza códigos en mayúsculas y descriptivos (ej. <strong>GPS</strong>, <strong>EXTINTOR</strong>, <strong>CARGADOR_SOLAR</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>La clave única se evalúa por categoría, permitiendo códigos específicos dentro de cada categoría.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Incluye una descripción breve que aclare especificaciones o normas técnicas del accesorio.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
