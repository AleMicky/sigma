import {
  CalendarClock,
  CheckCircle2,
  FileCheck,
  FileText,
  HelpCircle,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type TipoDocumentoHelpModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TipoDocumentoHelpModal({
  open,
  onOpenChange,
}: TipoDocumentoHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <HelpCircle className="size-5" />
            <DialogTitle className="font-heading text-xl">
              Guía de Parametrización: Tipos de Documento
            </DialogTitle>
          </div>
          <DialogDescription>
            Criterios y buenas prácticas para clasificar los documentos adjuntos a los activos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Categoría Con Vencimiento */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
              <CalendarClock className="size-4" />
              <h4>Documentos con Vencimiento / Caducidad</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Activa esta opción para documentos temporales sujetos a renovaciones periódicas. El sistema permitirá registrar fecha de expiración y generará alertas de seguimiento.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-medium text-amber-800 dark:text-amber-200">
                POLIZA_SEGURO
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-medium text-amber-800 dark:text-amber-200">
                GARANTIA_TECNICA
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-medium text-amber-800 dark:text-amber-200">
                CONTRATO_MANT
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-mono font-medium text-amber-800 dark:text-amber-200">
                CERT_CALIBRACION
              </span>
            </div>
          </div>

          {/* Categoría Permanente */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
              <FileCheck className="size-4" />
              <h4>Documentos de Vigencia Permanente</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Documentos que forman parte del expediente histórico del bien y no caducan con el tiempo.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                FACTURA
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                ACTA_ENTREGA
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                MANUAL_USUARIO
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-800 dark:text-emerald-200">
                FICHA_TECNICA
              </span>
            </div>
          </div>

          {/* Buenas Prácticas */}
          <div className="space-y-2 pt-1">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Recomendaciones de Estandarización
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Utiliza códigos en mayúsculas sin espacios (ej. <strong>FACTURA_COMPRA</strong>, <strong>POLIZA</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>Agrega descripciones claras indicando el propósito y cuándo debe asociarse al activo.</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
