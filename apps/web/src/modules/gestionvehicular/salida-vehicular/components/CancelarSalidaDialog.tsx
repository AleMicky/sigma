import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

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
import { Textarea } from "@/shared/components/ui/textarea"

import { useCancelarSalidaMutation } from "../api/salida-vehicular.mutations"
import type { SalidaVehicular } from "../api/salida-vehicular.types"

interface CancelarSalidaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salida: SalidaVehicular | null
}

export function CancelarSalidaDialog({
  open,
  onOpenChange,
  salida,
}: CancelarSalidaDialogProps) {
  const [motivo, setMotivo] = useState("")

  const cancelarMutation = useCancelarSalidaMutation()

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salida) return

    await cancelarMutation.mutateAsync({
      id: salida.id,
      data: { motivo: motivo.trim() || undefined },
    })

    setMotivo("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleCancel}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancelar Salida Vehicular
            </DialogTitle>
            <DialogDescription className="text-xs">
              ¿Está seguro de que desea cancelar la salida vehicular{" "}
              <span className="font-semibold text-foreground">{salida?.numero}</span>? Esta acción detendrá el proceso BPMN Flowable.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-xs space-y-2">
            <Label htmlFor="motivo-cancelacion" className="text-xs font-medium">
              Motivo de la Cancelación (Opcional)
            </Label>
            <Textarea
              id="motivo-cancelacion"
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Indique el motivo de suspensión o cancelación..."
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={cancelarMutation.isPending}
              className="text-xs"
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={cancelarMutation.isPending}
              className="text-xs gap-1.5"
            >
              {cancelarMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar Cancelación"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
