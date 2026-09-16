import { Clock, FileText, ImageIcon, Paperclip, Wrench, X } from "lucide-react"

import { ActivoCombobox } from "@/modules/mantenimientos/orden-trabajo/components/ActivoCombobox"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"
import { useSolicitudFormContext } from "../../context/solicitud-form.context"

export function SolicitudTecnicaSection() {
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
    registerActivo,
  } = useSolicitudFormContext()

  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-4">
      {/* Encabezado de Sección */}
      <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
        <div className="flex size-6.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Wrench className="size-3.5" />
        </div>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            2. Activo y Descripción Técnica
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
        {/* Activo / Ubicación */}
        <form.Field name="activoId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Activo / Ubicación
                </RequiredFieldLabel>

                <ActivoCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val, act) => {
                    field.handleChange(val)
                    if (act) registerActivo(act)
                  }}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Buscar activo por código, nombre, ubicación o placa..."
                  className="w-full text-xs sm:text-sm"
                />

                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>

        {/* Fecha y Hora de Solicitud */}
        <form.Field name="fechaSolicitud">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  Fecha y Hora de Solicitud
                </FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    type="datetime-local"
                    name={field.name}
                    value={field.state.value ?? ""}
                    disabled
                    aria-invalid={isInvalid}
                    className="h-9.5 text-xs sm:text-sm shadow-2xs pr-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                  <Clock className="pointer-events-none absolute right-3 top-2.5 size-4 text-muted-foreground" />
                </div>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>
      </div>

      {/* Descripción Detallada */}
      <form.Field name="descripcion">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <div className="flex items-center justify-between">
                <RequiredFieldLabel htmlFor={field.name}>
                  Descripción Detallada
                </RequiredFieldLabel>
                <span className="text-[10.5px] text-muted-foreground">
                  {field.state.value.length} / 2000 caracteres
                </span>
              </div>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                aria-invalid={isInvalid}
                rows={3}
                maxLength={2000}
                className="text-xs sm:text-sm shadow-2xs resize-y"
              />
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>

      {/* Archivos y Evidencias Adjuntas */}
      <div className="space-y-2.5 pt-1">
        <FieldLabel htmlFor="solicitud-file-dropzone" className="text-xs font-semibold">
          Archivos y Evidencias Adjuntas (Opcional)
        </FieldLabel>

        <div
          id="solicitud-file-dropzone"
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.005]"
              : "border-border/80 bg-muted/15 hover:bg-muted/30 hover:border-primary/50",
          )}
        >
          <input
            id="solicitud-page-file-input"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
            className="sr-only"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-3 text-center sm:text-left pointer-events-none">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground border shadow-2xs">
              <ImageIcon className="size-4.5 text-primary" />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground">
                <label
                  htmlFor="solicitud-page-file-input"
                  className="cursor-pointer text-primary underline underline-offset-2 hover:text-primary/80 font-semibold pointer-events-auto"
                >
                  Seleccionar archivos
                </label>{" "}
                o arrastrar y soltar aquí
              </p>
              <p className="text-[11px] text-muted-foreground">
                PNG, JPG, GIF o PDF hasta 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11.5px] font-semibold text-foreground flex items-center gap-1.5">
              <Paperclip className="size-3 text-primary" />
              Archivos listos para enviar ({selectedFiles.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5 border border-border/70 text-xs"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <FileText className="size-3.5 text-primary shrink-0" />
                    <div className="truncate min-w-0">
                      <p className="font-medium text-foreground truncate text-[11.5px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeFile(idx)}
                    className="size-5 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="size-3" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Existing attachments when editing */}
        {isEditing && existingAdjuntos && existingAdjuntos.length > 0 ? (
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <p className="text-[11.5px] font-semibold text-foreground flex items-center gap-1.5">
              <Paperclip className="size-3 text-muted-foreground" />
              Adjuntos existentes ({existingAdjuntos.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {existingAdjuntos.map((adj) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-card px-2.5 py-1.5 border border-border text-xs"
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <FileText className="size-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={adj.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary hover:underline truncate text-[11.5px]"
                    >
                      {adj.nombreArchivo}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
