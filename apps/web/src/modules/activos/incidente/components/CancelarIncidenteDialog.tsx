import * as React from "react"
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

import { useCancelarIncidenteMutation } from "../api/incidente.mutations"

interface CancelarIncidenteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incidenteId: string
  onSuccess?: () => void
}

export function CancelarIncidenteDialog({
  open,
  onOpenChange,
  incidenteId,
  onSuccess,
}: CancelarIncidenteDialogProps) {
  const [motivo, setMotivo] = React.useState("")
  const cancelarMutation = useCancelarIncidenteMutation()

  const handleCancelar = () => {
    cancelarMutation.mutate(
      { id: incidenteId, data: { motivo: motivo.trim() || undefined } },
      {
        onSuccess: () => {
          onOpenChange(false)
          setMotivo("")
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <DialogTitle>Cancelar Incidente</DialogTitle>
          </div>
          <DialogDescription>
            Esta acción detendrá de forma definitiva el proceso Flowable asociado a este
            incidente y lo marcará como cancelado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label className="text-sm font-medium">Motivo de cancelación</Label>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ingrese el motivo por el cual se cancela el proceso..."
            rows={3}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelarMutation.isPending}
          >
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelar}
            disabled={cancelarMutation.isPending}
            className="gap-2"
          >
            {cancelarMutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Confirmar Cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

