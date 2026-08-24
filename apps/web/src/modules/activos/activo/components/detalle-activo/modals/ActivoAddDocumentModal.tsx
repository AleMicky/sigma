import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  CheckCircle2,
  FilePlus,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Pencil,
  RefreshCw,
  Tag,
  UploadCloud,
  X,
} from "lucide-react"
import { toast } from "sonner"

import {
  useCreateActivoDocumento,
  useReplaceActivoDocumentoFile,
  useUpdateActivoDocumento,
} from "@/modules/activos/activo-documento/api/activo-documento.mutations"
import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import { tipoDocumentoQueries } from "@/modules/activos/tipo-documento/api/tipo-documento.queries"
import type { TipoDocumento } from "@/modules/activos/tipo-documento/api/tipo-documento.service"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
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
import { cn } from "@/shared/lib/utils"

import { formatFileSize } from "../tabs/ActivoDocumentosTab"

type ActivoAddDocumentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activoId: string
  activoCodigo: string
  itemToEdit?: ActivoDocumento | null
}

function getFileFormatMeta(fileName: string, mimeType?: string | null) {
  const ext = fileName.split(".").pop()?.toLowerCase() || ""
  if (["pdf"].includes(ext) || mimeType?.includes("pdf")) {
    return {
      Icon: FileText,
      color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
      label: "PDF",
    }
  }
  if (
    ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ||
    mimeType?.includes("image")
  ) {
    return {
      Icon: ImageIcon,
      color:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      label: "IMAGEN",
    }
  }
  if (
    ["xls", "xlsx", "csv"].includes(ext) ||
    mimeType?.includes("sheet") ||
    mimeType?.includes("excel")
  ) {
    return {
      Icon: FileSpreadsheet,
      color:
        "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
      label: "EXCEL",
    }
  }
  if (["doc", "docx"].includes(ext) || mimeType?.includes("word")) {
    return {
      Icon: FileText,
      color:
        "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
      label: "WORD",
    }
  }
  return {
    Icon: FileText,
    color: "text-primary bg-primary/10 border-primary/20",
    label: ext.toUpperCase() || "DOC",
  }
}

export function ActivoAddDocumentModal({
  open,
  onOpenChange,
  activoId,
  activoCodigo,
  itemToEdit,
}: ActivoAddDocumentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = Boolean(itemToEdit)

  const createMutation = useCreateActivoDocumento()
  const updateMutation = useUpdateActivoDocumento()
  const replaceFileMutation = useReplaceActivoDocumentoFile()

  const tiposDocumentoQuery = useQuery({
    ...tipoDocumentoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
    enabled: open,
  })
  const tiposDocumento = tiposDocumentoQuery.data?.content ?? []

  const [tipoDocumentoId, setTipoDocumentoId] = useState("")
  const [nombre, setNombre] = useState("")
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fechaEmision, setFechaEmision] = useState("")
  const [fechaVencimiento, setFechaVencimiento] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const selectedTipo = useMemo(
    () => tiposDocumento.find((t) => t.id === tipoDocumentoId) ?? null,
    [tiposDocumento, tipoDocumentoId],
  )
  const requiereVencimiento = Boolean(selectedTipo?.requiereVencimiento)

  function resetForm() {
    setTipoDocumentoId("")
    setNombre("")
    setNumeroDocumento("")
    setDescripcion("")
    setFechaEmision("")
    setFechaVencimiento("")
    setSelectedFile(null)
    setIsDragging(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    if (open) {
      if (itemToEdit) {
        setTipoDocumentoId(itemToEdit.tipoDocumentoId || "")
        setNombre(itemToEdit.nombre || "")
        setNumeroDocumento(itemToEdit.numeroDocumento ?? "")
        setDescripcion(itemToEdit.descripcion ?? "")
        setFechaEmision(itemToEdit.fechaEmision ?? "")
        setFechaVencimiento(itemToEdit.fechaVencimiento ?? "")
        setSelectedFile(null)
      } else {
        resetForm()
      }
    }
  }, [open, itemToEdit])

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    replaceFileMutation.isPending

  function handleClose(isOpen: boolean) {
    if (!isOpen && !isPending) {
      resetForm()
      onOpenChange(false)
    }
  }

  function processFile(file: File) {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("El archivo supera el tamaño máximo permitido de 20 MB")
      return
    }
    setSelectedFile(file)
    if (!nombre.trim() && !isEditing) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setNombre(nameWithoutExt)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!tipoDocumentoId) {
      toast.error("Selecciona un tipo de documento")
      return
    }

    if (!nombre.trim()) {
      toast.error("Ingresa el título del documento")
      return
    }

    if (requiereVencimiento && !fechaVencimiento) {
      toast.error(
        `El tipo "${selectedTipo?.nombre}" requiere obligatoriamente una fecha de vencimiento`,
      )
      return
    }

    if (!isEditing && !selectedFile) {
      toast.error("Debes adjuntar un archivo físico para el documento")
      return
    }

    try {
      if (isEditing && itemToEdit) {
        // 1. Update metadata
        await updateMutation.mutateAsync({
          id: itemToEdit.id,
          payload: {
            activoId,
            tipoDocumentoId,
            nombre: nombre.trim(),
            numeroDocumento: numeroDocumento.trim() || null,
            descripcion: descripcion.trim() || null,
            fechaEmision: fechaEmision || null,
            fechaVencimiento: fechaVencimiento || null,
          },
        })

        // 2. Replace file if user uploaded a new one
        if (selectedFile) {
          await replaceFileMutation.mutateAsync({
            id: itemToEdit.id,
            file: selectedFile,
          })
        }

        handleClose(false)
      } else if (selectedFile) {
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
      }
    } catch {
      // Error handled in mutation
    }
  }

  // Active file preview info
  const activeFileMeta = useMemo(() => {
    if (selectedFile) {
      return {
        ...getFileFormatMeta(selectedFile.name, selectedFile.type),
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        isNew: true,
      }
    }
    if (isEditing && itemToEdit) {
      return {
        ...getFileFormatMeta(itemToEdit.nombreArchivo, itemToEdit.mimeType),
        name: itemToEdit.nombreArchivo || "Archivo adjunto existente",
        size: formatFileSize(itemToEdit.size),
        isNew: false,
      }
    }
    return null
  }, [selectedFile, isEditing, itemToEdit])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[92vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-lg">
        {/* Compact Header */}
        <DialogHeader className="flex flex-row items-center gap-2.5 p-3.5 sm:px-4 border-b border-border/70 bg-muted/20 text-left">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
            {isEditing ? (
              <Pencil className="size-3.5" />
            ) : (
              <FilePlus className="size-3.5" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <DialogTitle className="text-sm font-heading font-bold text-foreground">
                {isEditing ? "Editar Documento" : "Adjuntar Documento"}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground truncate">
                {isEditing
                  ? "Actualiza los datos o sustituye el archivo"
                  : "Asocia pólizas, certificaciones o actas"}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[9px] font-bold bg-background border-border/80 px-1.5 py-0 shrink-0"
            >
              {activoCodigo}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 p-3.5 sm:p-4 text-xs">
          {/* Tipo de Documento con diseño de tarjeta seleccionada */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-semibold flex items-center justify-between">
              <span>
                Tipo de Documento <span className="text-destructive">*</span>
              </span>
              {requiereVencimiento && (
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  Requiere vencimiento
                </span>
              )}
            </Label>

            {selectedTipo ? (
              <div className="flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background p-2 shadow-2xs hover:border-primary/40 transition-all">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {selectedTipo.nombre}
                      </span>
                      {selectedTipo.codigo && (
                        <code className="text-[9px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded shrink-0 uppercase">
                          {selectedTipo.codigo}
                        </code>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Tag className="size-3 text-muted-foreground/80 shrink-0" />
                      <span className="truncate">
                        {selectedTipo.requiereVencimiento
                          ? "Documento con vigencia temporal"
                          : "Documento permanente / técnico"}
                      </span>
                    </div>
                  </div>
                </div>

                {!isPending && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setTipoDocumentoId("")}
                    className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0 cursor-pointer"
                    title="Cambiar tipo de documento"
                  >
                    <X className="size-3.5" />
                    <span className="sr-only">Remover selección</span>
                  </Button>
                )}
              </div>
            ) : (
              <Combobox
                items={tiposDocumento}
                itemToStringLabel={(item: TipoDocumento) =>
                  item ? `${item.nombre} (${item.codigo})` : ""
                }
                itemToStringValue={(item: TipoDocumento) => item?.id ?? ""}
                value={null}
                onValueChange={(val: TipoDocumento | null) => {
                  setTipoDocumentoId(val?.id ?? "")
                }}
                disabled={isPending || tiposDocumentoQuery.isLoading}
              >
                <div className="relative w-full">
                  <ComboboxInput
                    placeholder={
                      tiposDocumentoQuery.isLoading
                        ? "Cargando tipos de documento..."
                        : "Buscar o seleccionar tipo de documento..."
                    }
                    className="h-8 text-xs w-full bg-background shadow-2xs"
                  />
                  {tiposDocumentoQuery.isLoading && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>

                <ComboboxContent className="z-50 max-h-56 min-w-[290px] p-1 rounded-xl shadow-lg border border-border/80">
                  <ComboboxEmpty className="py-3 text-xs text-muted-foreground text-center">
                    {tiposDocumentoQuery.isLoading
                      ? "Cargando tipos de documento..."
                      : "No se encontraron tipos coincidentes."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(tipo: TipoDocumento) => (
                      <ComboboxItem
                        key={tipo.id}
                        value={tipo}
                        className="cursor-pointer py-1.5 px-2 rounded-lg hover:bg-accent/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <FileText className="size-3" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="truncate text-xs font-semibold text-foreground">
                                {tipo.nombre}
                              </span>
                              {tipo.codigo && (
                                <code className="text-[9px] font-mono text-muted-foreground bg-muted px-1 rounded uppercase">
                                  {tipo.codigo}
                                </code>
                              )}
                            </div>
                            {tipo.requiereVencimiento && (
                              <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400">
                                Requiere fecha de vencimiento
                              </span>
                            )}
                          </div>
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          </div>

          {/* Row 2: Título & N° Referencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Título / Denominación */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] font-semibold">
                Título / Denominación <span className="text-destructive">*</span>
              </Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Póliza Seguro Todo Riesgo 2026"
                className="h-8 text-xs bg-background"
                disabled={isPending}
                required
              />
            </div>

            {/* N° Documento */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] font-semibold flex items-center justify-between">
                <span>N° Referencia / Póliza</span>
                <span className="text-[9px] font-normal text-muted-foreground">Opcional</span>
              </Label>
              <Input
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ej. POL-9921-A"
                className="h-8 text-xs bg-background font-mono"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Row 3: Fechas Emisión & Vencimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Fecha Emisión */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] font-semibold flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Fecha Emisión</span>
              </Label>
              <Input
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
                className="h-8 text-xs font-mono bg-background"
                disabled={isPending}
              />
            </div>

            {/* Fecha Vencimiento */}
            <div className="flex flex-col gap-1">
              <Label className="text-[11px] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  <span>
                    Fecha Vence{" "}
                    {requiereVencimiento && (
                      <span className="text-destructive font-bold">*</span>
                    )}
                  </span>
                </span>
                {requiereVencimiento && (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                    Requerido
                  </span>
                )}
              </Label>
              <Input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className={cn(
                  "h-8 text-xs font-mono bg-background",
                  requiereVencimiento &&
                    !fechaVencimiento &&
                    "border-amber-500/50 focus-visible:ring-amber-500/20",
                )}
                required={requiereVencimiento}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Row 4: Descripción */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] font-semibold flex items-center justify-between">
              <span>Descripción / Observaciones</span>
              <span className="text-[9px] font-normal text-muted-foreground">Opcional</span>
            </Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre cobertura, aseguradora o notas..."
              rows={1}
              className="text-xs resize-none min-h-[38px] bg-background py-1.5"
              disabled={isPending}
            />
          </div>

          {/* Row 5: Archivo Adjunto */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold flex items-center gap-1">
                <Paperclip className="size-3 text-muted-foreground" />
                <span>
                  Archivo Adjunto{" "}
                  {!isEditing && <span className="text-destructive">*</span>}
                </span>
              </Label>
              <span className="text-[10px] text-muted-foreground">
                PDF, JPG, PNG, DOCX (Máx 20 MB)
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              disabled={isPending}
            />

            {activeFileMeta ? (
              <div
                className={cn(
                  "flex items-center justify-between gap-2 p-2 rounded-lg border transition-all",
                  activeFileMeta.isNew
                    ? "border-primary/40 bg-primary/5 shadow-2xs"
                    : "border-border/80 bg-muted/20",
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md border",
                      activeFileMeta.color,
                    )}
                  >
                    <activeFileMeta.Icon className="size-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {activeFileMeta.name}
                      </span>
                      {activeFileMeta.isNew ? (
                        <Badge
                          variant="outline"
                          className="text-[8px] font-bold px-1 py-0 bg-primary/10 text-primary border-primary/20 shrink-0"
                        >
                          Nuevo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[8px] font-medium px-1 py-0 text-muted-foreground shrink-0"
                        >
                          Actual
                        </Badge>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {activeFileMeta.size} • {activeFileMeta.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-6.5 text-[10px] font-medium gap-1 px-2"
                  >
                    <RefreshCw className="size-2.5" />
                    Cambiar
                  </Button>
                  {activeFileMeta.isNew && (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => {
                        setSelectedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      className="size-6.5 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "p-3 border border-dashed rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-center",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border/80 bg-muted/15 hover:bg-muted/30 hover:border-primary/50",
                )}
              >
                <UploadCloud className="size-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  {isDragging ? "Suelta el archivo aquí" : "Seleccionar o arrastrar archivo"}
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleClose(false)}
              className="h-7.5 px-3 text-xs font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-7.5 px-3.5 text-xs font-semibold shadow-xs gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : isEditing ? (
                <>
                  <CheckCircle2 className="size-3" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <>
                  <FilePlus className="size-3" />
                  <span>Guardar Documento</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


