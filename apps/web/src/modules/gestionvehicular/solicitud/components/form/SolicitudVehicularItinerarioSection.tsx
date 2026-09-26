import {
  Clock,
  FileIcon,
  FileText,
  ImageIcon,
  MapPin,
  Paperclip,
  Users,
  X,
} from "lucide-react"

import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function SolicitudVehicularItinerarioSection() {
  const {
    form,
    isEditing,
    selectedFiles,
    isDragging,
    setIsDragging,
    handleFileChange,
    handleDrop,
    removeFile,
    existingAdjuntos,
    tiposMap,
  } = useSolicitudVehicularFormContext()

  return (
    <div className="p-3 sm:p-3.5 space-y-2.5">
      {/* Encabezado de Sección */}
      <div className="flex items-center gap-1.5 pb-1 border-b border-border/40">
        <div className="flex size-5.5 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <MapPin className="size-3" />
        </div>
        <h2 className="text-xs font-semibold text-foreground tracking-tight">
          2. Itinerario y Requerimientos del Viaje
        </h2>
      </div>

      {/* 1. FILA: DESTINO Y PASAJEROS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-start">
        <div className="sm:col-span-2">
          <form.Field name="destino">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                    Destino del Viaje
                  </RequiredFieldLabel>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Ej. Planta Corani - Cochabamba"
                      className="pl-8 h-8.5 text-xs shadow-2xs"
                      aria-invalid={isInvalid}
                    />
                  </div>
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          </form.Field>
        </div>

        <form.Field name="cantidadPasajeros">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                  N° Pasajeros
                </RequiredFieldLabel>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={1}
                    step={1}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    placeholder="1"
                    className="pl-8 h-8.5 text-xs shadow-2xs"
                    aria-invalid={isInvalid}
                  />
                </div>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>
      </div>

      {/* 2. FILA: FECHAS DE SALIDA Y RETORNO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
        <form.Field name="fechaSalida">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                  Fecha y Hora de Salida
                </RequiredFieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="h-8.5 text-xs shadow-2xs pr-8"
                    aria-invalid={isInvalid}
                  />
                  <Clock className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-muted-foreground" />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="fechaRetornoEstimada">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                  Fecha y Hora Retorno Estimada
                </RequiredFieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="h-8.5 text-xs shadow-2xs pr-8"
                    aria-invalid={isInvalid}
                  />
                  <Clock className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-muted-foreground" />
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      {/* 3. MOTIVO */}
      <form.Field name="motivo">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                Motivo / Asunto del Viaje
              </RequiredFieldLabel>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Ej. Inspección de turbinas en Central Hidroeléctrica Corani"
                  className="pl-8 h-8.5 text-xs shadow-2xs"
                  aria-invalid={isInvalid}
                />
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* 4. JUSTIFICACIÓN Y OBSERVACIONES DINÁMICAS SEGÚN TIPO */}
      <form.Subscribe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selector={(state: any) => state.values.tipoSolicitudVehicularId}
      >
        {(tipoSolicitudVehicularId: string) => {
          const selectedTipo = tiposMap.get(tipoSolicitudVehicularId)
          const requiereJustificacion = Boolean(selectedTipo?.requiereJustificacion)
          const requiereRespaldo = Boolean(selectedTipo?.requiereRespaldo)

          return (
            <div className="space-y-2.5">
              {/* Campos de texto (Justificación si aplica + Observaciones) */}
              <div
                className={cn(
                  "grid gap-2.5 items-start",
                  requiereJustificacion
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
                )}
              >
                {requiereJustificacion && (
                  <form.Field name="justificacion">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(field: any) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid || undefined}>
                          <div className="flex items-center justify-between">
                            <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                              <span>Justificación Operativa / Técnica</span>
                            </RequiredFieldLabel>
                            <span className="text-[10px] text-muted-foreground">
                              {field.state.value?.length || 0}/1000
                            </span>
                          </div>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="Detalla los motivos técnicos u operativos..."
                            rows={2}
                            maxLength={1000}
                            className="text-xs shadow-2xs resize-y min-h-[58px]"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  </form.Field>
                )}

                <form.Field name="observacion">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(field: any) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid || undefined}>
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            <span>Observaciones Adicionales</span>
                          </FieldLabel>
                          <span className="text-[10px] text-muted-foreground">
                            {field.state.value?.length || 0}/1000
                          </span>
                        </div>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Equipos a transportar, chofer, paradas..."
                          rows={2}
                          maxLength={1000}
                          className="text-xs shadow-2xs resize-y min-h-[58px]"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    )
                  }}
                </form.Field>
              </div>

              {/* 5. ARCHIVOS Y DOCUMENTOS DE RESPALDO (DINÁMICO: OCULTO POR DEFECTO, VISIBLE SOLO SI EL TIPO LO REQUIERE O HAY ARCHIVOS) */}
              {(requiereRespaldo ||
                selectedFiles.length > 0 ||
                (isEditing && existingAdjuntos && existingAdjuntos.length > 0)) && (
                <div className="space-y-1.5 pt-0.5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2">
                    {requiereRespaldo ? (
                      <RequiredFieldLabel
                        htmlFor="solicitud-vehicular-dropzone"
                        className="text-[11.5px] font-medium"
                      >
                        Archivos y Respaldos Adjuntos
                      </RequiredFieldLabel>
                    ) : (
                      <FieldLabel
                        htmlFor="solicitud-vehicular-dropzone"
                        className="text-[11.5px] font-medium"
                      >
                        Archivos Adjuntos
                      </FieldLabel>
                    )}
                    {requiereRespaldo && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        (Obligatorio para este tipo)
                      </span>
                    )}
                  </div>

                  {!isEditing && (
                    <div
                      id="solicitud-vehicular-dropzone"
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "relative flex items-center justify-between rounded-lg border border-dashed px-3 py-2 transition-all",
                        isDragging
                          ? "border-primary bg-primary/5"
                          : requiereRespaldo
                            ? "border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 hover:border-primary/50"
                            : "border-border/80 bg-muted/15 hover:bg-muted/25 hover:border-primary/50"
                      )}
                    >
                      <input
                        id="solicitud-vehicular-file-input"
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
                        className="sr-only"
                        onChange={handleFileChange}
                      />

                      <div className="flex items-center gap-2.5 pointer-events-none">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground border shadow-2xs">
                          <ImageIcon className="size-3.5 text-primary" />
                        </div>

                        <p className="text-xs text-muted-foreground">
                          <label
                            htmlFor="solicitud-vehicular-file-input"
                            className="cursor-pointer text-primary underline underline-offset-2 hover:text-primary/80 font-medium pointer-events-auto"
                          >
                            Seleccionar archivos
                          </label>{" "}
                          o arrastra aquí (PNG, JPG, PDF máx 10MB)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Archivos seleccionados listos para enviar */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                        <Paperclip className="size-3 text-primary" />
                        Archivos ({selectedFiles.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedFiles.map((file, idx) => (
                          <div
                            key={`${file.name}-${idx}`}
                            className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1 border border-border/70 text-xs"
                          >
                            <div className="flex items-center gap-1.5 truncate min-w-0">
                              <FileText className="size-3 text-primary shrink-0" />
                              <div className="truncate min-w-0 flex items-center gap-1.5">
                                <p className="font-medium text-foreground truncate text-[11px]">
                                  {file.name}
                                </p>
                                <span className="text-[9.5px] text-muted-foreground">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => removeFile(idx)}
                              className="size-4.5 text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <X className="size-2.5" />
                              <span className="sr-only">Remover</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Adjuntos existentes en edición */}
                  {isEditing && existingAdjuntos && existingAdjuntos.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-border/50">
                      <p className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                        <Paperclip className="size-3 text-muted-foreground" />
                        Adjuntos asociados ({existingAdjuntos.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {existingAdjuntos.map((adj) => (
                          <div
                            key={adj.id}
                            className="flex items-center justify-between gap-2 rounded-md bg-card px-2 py-1 border border-border text-xs"
                          >
                            <div className="flex items-center gap-1.5 truncate min-w-0">
                              <FileIcon className="size-3 text-muted-foreground shrink-0" />
                              <a
                                href={adj.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-primary hover:underline truncate text-[11px]"
                              >
                                {adj.nombreOriginal || adj.nombreArchivo}
                              </a>
                            </div>
                            <span className="text-[9.5px] text-muted-foreground shrink-0">
                              {formatFileSize(adj.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        }}
      </form.Subscribe>
    </div>
  )
}
