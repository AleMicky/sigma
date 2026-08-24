import { useState } from "react"
import { Loader2, Paperclip, Upload } from "lucide-react"

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
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateOrdenTrabajoAdjunto,
  useReplaceOrdenTrabajoAdjunto,
} from "../api/orden-trabajo.mutations"
import type { OrdenTrabajoAdjunto } from "../api/orden-trabajo.service"

type OrdenTrabajoAdjuntoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ordenTrabajoId: string
  adjuntoToReplace?: OrdenTrabajoAdjunto | null
  onSuccess?: () => void
}

export function OrdenTrabajoAdjuntoDialog({
  open,
  onOpenChange,
  ordenTrabajoId,
  adjuntoToReplace,
  onSuccess,
}: OrdenTrabajoAdjuntoDialogProps) {
  const isReplacing = Boolean(adjuntoToReplace?.id)

  const uploadMutation = useCreateOrdenTrabajoAdjunto()
  const replaceMutation = useReplaceOrdenTrabajoAdjunto()

  const [file, setFile] = useState<File | null>(null)
  const [descripcion, setDescripcion] = useState<string>("")

  const isSubmitting = uploadMutation.isPending || replaceMutation.isPending
  const isValid = Boolean(file && ordenTrabajoId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || !file || isSubmitting) return

    if (isReplacing && adjuntoToReplace?.id) {
      await replaceMutation.mutateAsync({
        ordenTrabajoId,
        id: adjuntoToReplace.id,
        file,
      })
      setFile(null)
      onSuccess?.()
      onOpenChange(false)
    } else {
      await uploadMutation.mutateAsync({
        ordenTrabajoId,
        payload: { descripcion: descripcion.trim() || null },
        file,
      })
      setFile(null)
      setDescripcion("")
      onSuccess?.()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4 sm:p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              <Paperclip className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isReplacing ? "Reemplazar Archivo Adjunto" : "Subir Adjunto a Orden de Trabajo"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Documentos, manuales, fichas técnicas o informes en PDF, Word o imágenes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ot-file" className="text-xs font-semibold">
              Seleccionar Archivo *
            </Label>
            <Input
              id="ot-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="h-9 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              required
            />
            {file && (
              <p className="text-[11px] text-muted-foreground">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          {!isReplacing && (
            <div className="space-y-1.5">
              <Label htmlFor="ot-adj-desc" className="text-xs font-semibold">
                Descripción / Referencia del Archivo
              </Label>
              <Textarea
                id="ot-adj-desc"
                placeholder="Ej: Reporte de calibración de sensores, manual de reemplazo..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={2}
                maxLength={500}
                className="text-xs resize-none"
              />
            </div>
          )}

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
              className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  <span>{isReplacing ? "Reemplazar" : "Subir Archivo"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
