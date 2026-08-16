import { useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { FilePlus, FileText, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { useCreateActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.mutations"
import { tipoDocumentoQueries } from "@/modules/activos/tipo-documento/api/tipo-documento.queries"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

type ActivoAddDocumentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activoId: string
  activoCodigo: string
}

export function ActivoAddDocumentModal({
  open,
  onOpenChange,
  activoId,
  activoCodigo,
}: ActivoAddDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createMutation = useCreateActivoDocumento()

  const tiposDocumentoQuery = useQuery(
    tipoDocumentoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const tiposDocumento = tiposDocumentoQuery.data?.content ?? []

  const [tipoDocumentoId, setTipoDocumentoId] = useState("")
  const [nombre, setNombre] = useState("")
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaEmision, setFechaEmision] = useState("")
  const [fechaVencimiento, setFechaVencimiento] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const selectedTipo = tiposDocumento.find((t) => t.id === tipoDocumentoId)
  const requiereVencimiento = Boolean(selectedTipo?.requiereVencimiento)

  function resetForm() {
    setTipoDocumentoId("")
    setNombre("")
    setNumeroDocumento("")
    setDescripcion("")
    setFechaEmision("")
    setFechaVencimiento("")
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.size > 20 * 1024 * 1024) {
        toast.error("El archivo supera el tamaño máximo permitido de 20 MB")
        return
      }
      setSelectedFile(file)
      if (!nombre.trim()) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setNombre(nameWithoutExt)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!tipoDocumentoId) {
      toast.error("Selecciona un tipo de documento")
      return
    }

    if (!nombre.trim()) {
      toast.error("Ingresa el nombre o título del documento")
      return
    }

    if (requiereVencimiento && !fechaVencimiento) {
      toast.error(
        `El tipo "${selectedTipo?.nombre}" requiere obligatoriamente una fecha de vencimiento`,
      )
      return
    }

    if (!selectedFile) {
      toast.error("Debes adjuntar un archivo (PDF, JPG, PNG, etc.)")
      return
    }

    try {
      await createMutation.mutateAsync({
        payload: {
          activoId,
          tipoDocumentoId,
          nombre: nombre.trim(),
          numeroDocumento: numeroDocumento.trim() || null,
          descripcion: descripcion.trim() || null,
          fechaEmision: fechaEmision || null,
          fechaVencimiento: fechaVencimiento || null,
        },
        file: selectedFile,
      })

      handleClose(false)
    } catch {
      // Error handled in mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="size-4.5 text-primary" />
            Adjuntar Documento
          </DialogTitle>
          <DialogDescription>
            Asocia una póliza, certificación, acta o comprobante técnico al activo{" "}
            <span className="font-mono font-semibold text-foreground">
              {activoCodigo}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-2 text-xs">
          {/* Tipo de Documento */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">
              Tipo de Documento <span className="text-destructive">*</span>
            </Label>
            <Select
              value={tipoDocumentoId}
              onValueChange={(val) => {
                if (val) setTipoDocumentoId(val)
              }}
            >
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue placeholder="Selecciona un tipo de documento..." />
              </SelectTrigger>
              <SelectContent className="z-50 max-h-56">
                {tiposDocumento.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    <div className="flex items-center gap-2">
                      <span>{tipo.nombre}</span>
                      {tipo.requiereVencimiento && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-500/10 px-1 py-0.2 rounded">
                          Requiere vencimiento
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nombre / Título */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">
              Título / Nombre del Documento <span className="text-destructive">*</span>
            </Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. SOAT 2026 - Renovación Anual"
              className="h-8.5 text-xs"
              required
            />
          </div>

          {/* N° Documento y Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">
                N° de Póliza / Código Ref.
              </Label>
              <Input
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ej. POL-9921-A"
                className="h-8.5 text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Fecha de Emisión</Label>
              <Input
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
                className="h-8.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span>
                Fecha de Vencimiento{" "}
                {requiereVencimiento && (
                  <span className="text-destructive font-bold">*</span>
                )}
              </span>
              {requiereVencimiento && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Obligatorio para este tipo
                </span>
              )}
            </Label>
            <Input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              className="h-8.5 text-xs font-mono"
              required={requiereVencimiento}
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Descripción / Observaciones</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre cobertura, aseguradora o alcance..."
              rows={2}
              className="text-xs resize-none min-h-[50px]"
            />
          </div>

          {/* Archivo Adjunto */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">
              Archivo Adjunto <span className="text-destructive">*</span>
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            />

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 border-2 border-dashed border-border/80 rounded-xl bg-muted/20 flex flex-col items-center justify-center gap-1.5 hover:bg-muted/40 hover:border-primary/40 transition-colors cursor-pointer text-center"
              >
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">
                  Selecciona o arrastra un archivo
                </span>
                <span className="text-[10px] text-muted-foreground">
                  PDF, JPG, PNG, DOCX (Máx 20 MB)
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="size-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-foreground truncate">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={createMutation.isPending}
              onClick={() => handleClose(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="font-semibold shadow-xs"
            >
              {createMutation.isPending ? "Guardando..." : "Guardar Documento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
