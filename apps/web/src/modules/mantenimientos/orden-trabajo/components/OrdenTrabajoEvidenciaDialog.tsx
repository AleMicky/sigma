import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Camera,
  ExternalLink,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react"

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
  useDeleteOrdenTrabajoActividadEvidencia,
  useReplaceOrdenTrabajoActividadEvidencia,
} from "../api/orden-trabajo.mutations"
import { ordenTrabajoQueries } from "../api/orden-trabajo.queries"
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
  const deleteMutation = useDeleteOrdenTrabajoActividadEvidencia()

  const [file, setFile] = useState<File | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(true)

  // Query existing evidences for this activity
  const evidenciasQuery = useQuery({
    ...ordenTrabajoQueries.evidenciasList(actividadId, { size: 50 }),
    enabled: open && Boolean(actividadId),
  })

  const evidencias = evidenciasQuery.data?.content ?? []

  const isSubmitting =
    uploadMutation.isPending || replaceMutation.isPending || deleteMutation.isPending
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
      evidenciasQuery.refetch()
      onSuccess?.()
      onOpenChange(false)
    } else {
      await uploadMutation.mutateAsync({
        actividadId,
        file,
      })
      setFile(null)
      evidenciasQuery.refetch()
      onSuccess?.()
      // Keep open so they see the uploaded photo
    }
  }

  async function handleDeleteEvidencia(evidenciaId: string) {
    await deleteMutation.mutateAsync({
      actividadId,
      id: evidenciaId,
    })
    evidenciasQuery.refetch()
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-4 sm:p-5 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Camera className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isReplacing ? "Reemplazar Evidencia" : "Evidencias Gráficas y Fotografías"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate max-w-sm">
                {actividadNombre ? `Para: ${actividadNombre}` : "Fotos o comprobantes del trabajo realizado."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0">
          {/* Formulario de subida de nueva evidencia */}
          <form onSubmit={handleSubmit} className="space-y-3 p-3 rounded-xl border bg-muted/10">
            <div className="space-y-1.5">
              <Label htmlFor="evidencia-file" className="text-xs font-semibold flex items-center justify-between">
                <span>Subir Nueva Fotografía o Comprobante</span>
                <span className="text-[10px] text-muted-foreground font-normal">PNG, JPG, PDF</span>
              </Label>
              <Input
                id="evidencia-file"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="h-8.5 text-xs file:mr-2.5 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-500/15 file:text-amber-700 dark:file:text-amber-300 hover:file:bg-amber-500/25 cursor-pointer bg-background"
                required
              />
              {file && (
                <p className="text-[11px] text-muted-foreground">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={!isValid || isSubmitting}
                className="h-7.5 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
              >
                {uploadMutation.isPending || replaceMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" />
                    <span>{isReplacing ? "Reemplazar Evidencia" : "Subir Archivo"}</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Galería de Evidencias Existentes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>Evidencias Registradas ({evidencias.length})</span>
              </h4>
            </div>

            {evidenciasQuery.isLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-amber-600" />
                <span>Cargando fotografías...</span>
              </div>
            ) : evidencias.length === 0 ? (
              <div className="p-4 text-center border border-dashed rounded-xl text-xs text-muted-foreground bg-muted/5">
                No hay fotografías ni comprobantes adjuntos en esta tarea todavía.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {evidencias.map((ev) => (
                  <div
                    key={ev.id}
                    className="group relative rounded-xl border bg-card overflow-hidden shadow-2xs hover:border-border transition-all flex flex-col"
                  >
                    {/* Preview Image or File */}
                    <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      {ev.url && (ev.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || !ev.url.includes(".")) ? (
                        <img
                          src={ev.url}
                          alt={ev.nombreArchivo}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground p-2 text-center">
                          <ImageIcon className="size-6 text-amber-600" />
                          <span className="text-[10px] font-medium truncate max-w-[140px]">
                            {ev.nombreArchivo}
                          </span>
                        </div>
                      )}

                      {/* Overlay action buttons */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex size-7 items-center justify-center rounded-lg bg-white/90 text-foreground hover:bg-white transition-colors"
                            title="Ver en pantalla completa"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteEvidencia(ev.id)}
                          className="inline-flex size-7 items-center justify-center rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-colors cursor-pointer"
                          title="Eliminar evidencia"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2 text-xs flex items-center justify-between gap-1 border-t bg-card">
                      <span className="truncate font-medium text-[11px] text-foreground">
                        {ev.nombreArchivo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-3 sm:px-5 sm:py-3 border-t bg-muted/20 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
