import { useState } from "react"
import { Camera, Loader2, Upload } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

import {
  useCreateOrdenTrabajoActividadEvidencia,
  useReplaceOrdenTrabajoActividadEvidencia,
} from "../api/orden-trabajo.mutations"
import type { OrdenTrabajoActividadEvidencia } from "../api/orden-trabajo.service"

type OrdenTrabajoEvidenciaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actividadId: string
  actividadNombre?: string
  evidenciaToReplace?: OrdenTrabajoActividadEvidencia | null
  onSuccess?: () => void
}

export function OrdenTrabajoEvidenciaDialog({
  open,
  onOpenChange,
  actividadId,
  actividadNombre,
  evidenciaToReplace,
  onSuccess,
}: OrdenTrabajoEvidenciaDialogProps) {
  const isReplacing = Boolean(evidenciaToReplace?.id)

  const uploadMutation = useCreateOrdenTrabajoActividadEvidencia()
  const replaceMutation = useReplaceOrdenTrabajoActividadEvidencia()

  const [file, setFile] = useState<File | null>(null)

  const isSubmitting = uploadMutation.isPending || replaceMutation.isPending
  const isValid = Boolean(file && actividadId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || !file || isSubmitting) return

    if (isReplacing && evidenciaToReplace?.id) {
      await replaceMutation.mutateAsync({
        actividadId,
        id: evidenciaToReplace.id,
        file,
      })
      setFile(null)
      onSuccess?.()
      onOpenChange(false)
    } else {
      await uploadMutation.mutateAsync({
        actividadId,
        file,
      })
      setFile(null)
      onSuccess?.()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Camera className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isReplacing ? "Reemplazar Evidencia" : "Adjuntar Evidencia Gráfica / Fotográfica"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate max-w-xs">
                {actividadNombre ? `Para: ${actividadNombre}` : "Fotos o comprobantes del trabajo realizado."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="evidencia-file" className="text-xs font-semibold">
              Seleccionar Fotografía o Comprobante *
            </Label>
            <Input
              id="evidencia-file"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="h-9 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-500/15 file:text-amber-700 dark:file:text-amber-300 hover:file:bg-amber-500/25 cursor-pointer"
              required
            />
            {file && (
              <p className="text-[11px] text-muted-foreground">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!isValid || isSubmitting}
              className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  <span>{isReplacing ? "Reemplazar Evidencia" : "Subir Evidencia"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
