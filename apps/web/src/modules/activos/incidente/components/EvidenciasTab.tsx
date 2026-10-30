import * as React from "react"
import { Download, FileIcon, FileText, Image, Loader2, Trash2, UploadCloud } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

import {
  useEliminarEvidenciaMutation,
  useSubirEvidenciaMutation,
} from "../api/incidente.mutations"
import { useIncidenteEvidenciasQuery } from "../api/incidente.queries"

interface EvidenciasTabProps {
  incidenteId: string
  readOnly?: boolean
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function EvidenciasTab({ incidenteId, readOnly = false }: EvidenciasTabProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const { data: evidencias = [], isLoading } = useIncidenteEvidenciasQuery(incidenteId)

  const subirMutation = useSubirEvidenciaMutation(incidenteId)
  const eliminarMutation = useEliminarEvidenciaMutation(incidenteId)

  const isPending = subirMutation.isPending || eliminarMutation.isPending

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    subirMutation.mutate(file, {
      onSuccess: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      },
    })
  }

  const handleDelete = (evidenciaId: string) => {
    if (confirm("¿Estás seguro de eliminar este archivo probatorio?")) {
      eliminarMutation.mutate(evidenciaId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Evidencias y Archivos Adjuntos</h3>
          <p className="text-sm text-muted-foreground">
            Fotografías del siniestro, reportes policiales, presupuestos o cotizaciones.
          </p>
        </div>

        {!readOnly && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              size="sm"
              className="gap-2 bg-primary font-medium"
            >
              {subirMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              Subir Evidencia
            </Button>
          </div>
        )}
      </div>

      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Archivo</TableHead>
                <TableHead>Tipo MIME</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead className="w-28 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : evidencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    <FileIcon className="w-8 h-8 mx-auto text-muted-foreground/40 mb-1" />
                    No hay archivos de evidencia adjuntos a este incidente.
                  </TableCell>
                </TableRow>
              ) : (
                evidencias.map((ev) => {
                  const isImage = ev.mimeType.startsWith("image/")
                  const isPdf = ev.mimeType.includes("pdf")

                  return (
                    <TableRow key={ev.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                            {isImage ? (
                              <Image className="w-4 h-4 text-blue-500" />
                            ) : isPdf ? (
                              <FileText className="w-4 h-4 text-red-500" />
                            ) : (
                              <FileIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate max-w-xs">
                              {ev.nombreArchivo}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {ev.auditoria?.createdAt
                                ? new Date(ev.auditoria.createdAt).toLocaleString()
                                : ""}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {ev.mimeType}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatBytes(ev.size)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            title="Descargar / Ver archivo"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(ev.id)}
                              className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Eliminar evidencia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
