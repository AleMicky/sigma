import {
  AlertCircle,
  CalendarClock,
  FileIcon,
  FileText,
  MapPin,
  Paperclip,
  UploadCloud,
  Users,
  X,
} from "lucide-react"

import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"
import { DateTimePickerField } from "./DateTimePickerField"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function calculateDuration(salida?: string, retorno?: string): { text: string; isNegative: boolean } | null {
  if (!salida || !retorno) return null
  const dSalida = new Date(salida)
  const dRetorno = new Date(retorno)
  if (isNaN(dSalida.getTime()) || isNaN(dRetorno.getTime())) return null

  const diffMs = dRetorno.getTime() - dSalida.getTime()
  if (diffMs < 0) {
    return { text: "La fecha de retorno no puede ser anterior a la salida", isNegative: true }
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const days = Math.floor(diffMinutes / (24 * 60))
  const hours = Math.floor((diffMinutes % (24 * 60)) / 60)
  const minutes = diffMinutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days} ${days === 1 ? "día" : "días"}`)
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hora" : "horas"}`)
  if (minutes > 0 && days === 0) parts.push(`${minutes} min`)

  return { text: parts.length > 0 ? parts.join(", ") : "< 1 min", isNegative: false }
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
      <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
        <div className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-[10.5px] ring-1 ring-primary/20 shrink-0">
          2
        </div>
        <h2 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
          <span>Itinerario y Requerimientos</span>
          <MapPin className="size-3 text-muted-foreground/60" />
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
                <Field data-invalid={isInvalid || undefined} className="space-y-1">
                  <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                    Destino o Ruta del Viaje
                  </RequiredFieldLabel>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Ej. Planta Hidroeléctrica Corani / Subestación Santiváñez"
                      className="pl-8 h-8.5 text-xs shadow-2xs rounded-lg"
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
              <Field data-invalid={isInvalid || undefined} className="space-y-1">
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
                    max={50}
                    step={1}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    placeholder="1"
                    className="pl-8 h-8.5 text-xs shadow-2xs rounded-lg"
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

      {/* 2. FILA: FECHAS DE SALIDA Y RETORNO (Con validación de anticipación) */}
      <form.Subscribe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selector={(state: any) =>
          [
            state.values.tipoSolicitudVehicularId,
            state.values.fechaSalida,
            state.values.fechaRetornoEstimada,
          ] as const
        }
      >
        {([tipoSolicitudVehicularId, fechaSalida, fechaRetornoEstimada]) => {
          const selectedTipo = tiposMap.get(tipoSolicitudVehicularId)
          const diasAnticipacion =
            selectedTipo && typeof selectedTipo.diasAnticipacion === "number"
              ? selectedTipo.diasAnticipacion
              : 0

          const minSalidaDate = (() => {
            const d = new Date()
            d.setHours(0, 0, 0, 0)
            if (diasAnticipacion > 0) {
              d.setDate(d.getDate() + diasAnticipacion)
            }
            return d
          })()

          const minRetornoDate = (() => {
            if (fechaSalida) {
              const s = new Date(fechaSalida)
              if (!isNaN(s.getTime())) return s
            }
            return minSalidaDate
          })()

          const isAnticipacionInvalid = (() => {
            if (!fechaSalida || diasAnticipacion <= 0) return false
            const s = new Date(fechaSalida)
            s.setHours(0, 0, 0, 0)
            return s.getTime() < minSalidaDate.getTime()
          })()

          const duration = calculateDuration(fechaSalida, fechaRetornoEstimada)

          return (
            <div className="space-y-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                <form.Field name="fechaSalida">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(field: any) => {
                    const isInvalid =
                      (field.state.meta.isTouched && !field.state.meta.isValid) ||
                      isAnticipacionInvalid
                    return (
                      <Field
                        data-invalid={isInvalid || undefined}
                        className="space-y-1"
                      >
                        <RequiredFieldLabel
                          htmlFor={field.name}
                          className="text-xs"
                        >
                          Fecha y Hora de Salida
                        </RequiredFieldLabel>
                        <DateTimePickerField
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(val) => field.handleChange(val)}
                          onBlur={field.handleBlur}
                          placeholder="dd/mm/aaaa --:--"
                          minDate={minSalidaDate}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError
                            errors={
                              isAnticipacionInvalid
                                ? [
                                    `Requiere al menos ${diasAnticipacion} día(s) de anticipación (mínimo ${minSalidaDate.toLocaleDateString("es-ES")})`,
                                  ]
                                : field.state.meta.errors
                            }
                          />
                        )}
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
                      <Field
                        data-invalid={isInvalid || undefined}
                        className="space-y-1"
                      >
                        <RequiredFieldLabel
                          htmlFor={field.name}
                          className="text-xs"
                        >
                          Fecha y Hora Retorno Estimada
                        </RequiredFieldLabel>
                        <DateTimePickerField
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onChange={(val) => field.handleChange(val)}
                          onBlur={field.handleBlur}
                          placeholder="dd/mm/aaaa --:--"
                          minDate={minRetornoDate}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                </form.Field>
              </div>

              {/* Mensaje de Anticipación según Tipo Seleccionado */}
              {selectedTipo && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] border transition-colors",
                    diasAnticipacion > 0
                      ? "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                      : "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                  )}
                >
                  <CalendarClock className="size-3.5 shrink-0" />
                  <span>
                    {diasAnticipacion > 0 ? (
                      <>
                        Este tipo (<strong>{selectedTipo.nombre}</strong>) requiere{" "}
                        <strong>
                          {diasAnticipacion}{" "}
                          {diasAnticipacion === 1 ? "día" : "días"}
                        </strong>{" "}
                        de anticipación. Salida mínima:{" "}
                        <strong>
                          {minSalidaDate.toLocaleDateString("es-ES")}
                        </strong>
                      </>
                    ) : (
                      <>
                        Tipo <strong>{selectedTipo.nombre}</strong>: Salida inmediata
                        permitida (<strong>0 días</strong> de anticipación).
                      </>
                    )}
                  </span>
                </div>
              )}

              {/* Banner de Duración Calculada */}
              {duration && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] border transition-colors",
                    duration.isNegative
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800"
                      : "bg-primary/5 text-primary border-primary/20"
                  )}
                >
                  {duration.isNegative && (
                    <AlertCircle className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <span className="font-medium">
                    {duration.isNegative ? (
                      duration.text
                    ) : (
                      <>
                        Duración estimada: <strong>{duration.text}</strong>
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          )
        }}
      </form.Subscribe>

      {/* 3. MOTIVO */}
      <form.Field name="motivo">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid || undefined} className="space-y-1">
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
                  placeholder="Ej. Inspección y mantenimiento preventivo de generadores en Planta Corani"
                  className="pl-8 h-8.5 text-xs shadow-2xs rounded-lg"
                  aria-invalid={isInvalid}
                />
              </div>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* 4. JUSTIFICACIÓN Y OBSERVACIONES */}
      <form.Subscribe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        selector={(state: any) => state.values.tipoSolicitudVehicularId}
      >
        {(tipoSolicitudVehicularId: string) => {
          const selectedTipo = tiposMap.get(tipoSolicitudVehicularId)
          const isEmergencia =
            selectedTipo?.codigo?.toUpperCase() === "EMERGENCIA" ||
            selectedTipo?.diasAnticipacion === 0

          const requiereJustificacion = Boolean(selectedTipo?.requiereJustificacion)
          const requiereRespaldoEstricto = Boolean(selectedTipo?.requiereRespaldo) && !isEmergencia
          const permiteRespaldoOpcional = Boolean(selectedTipo?.requiereRespaldo) && isEmergencia

          return (
            <div className="space-y-2.5">
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
                        <Field data-invalid={isInvalid || undefined} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                              Justificación Operativa
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
                            placeholder="Detalla los motivos técnicos de urgencia o necesidad..."
                            rows={2}
                            maxLength={1000}
                            className="text-xs shadow-2xs resize-y min-h-[58px] rounded-lg"
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
                      <Field data-invalid={isInvalid || undefined} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <FieldLabel htmlFor={field.name} className="text-xs">
                            Observaciones Adicionales
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
                          placeholder="Equipos a transportar, paradas intermedias..."
                          rows={2}
                          maxLength={1000}
                          className="text-xs shadow-2xs resize-y min-h-[58px] rounded-lg"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    )
                  }}
                </form.Field>
              </div>

              {/* 5. DROPZONE */}
              {(requiereRespaldoEstricto ||
                permiteRespaldoOpcional ||
                selectedFiles.length > 0 ||
                (isEditing && existingAdjuntos && existingAdjuntos.length > 0)) && (
                <div className="space-y-1.5 pt-1 border-t border-border/40 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2">
                    {requiereRespaldoEstricto ? (
                      <RequiredFieldLabel
                        htmlFor="solicitud-vehicular-dropzone"
                        className="text-xs font-medium"
                      >
                        Documentos de Respaldo
                      </RequiredFieldLabel>
                    ) : (
                      <FieldLabel
                        htmlFor="solicitud-vehicular-dropzone"
                        className="text-xs font-medium"
                      >
                        Documentos de Respaldo / Informe (Opcional)
                      </FieldLabel>
                    )}
                    {requiereRespaldoEstricto && (
                      <Badge variant="outline" className="text-[9.5px] px-1.5 py-0 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900">
                        Obligatorio
                      </Badge>
                    )}
                    {permiteRespaldoOpcional && (
                      <Badge variant="outline" className="text-[9.5px] px-1.5 py-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900">
                        Opcional (se puede adjuntar informe posterior)
                      </Badge>
                    )}
                  </div>

                  {!isEditing && (
                    <div
                      id="solicitud-vehicular-dropzone"
                      role="button"
                      tabIndex={0}
                      onClick={() => document.getElementById("solicitud-vehicular-file-input")?.click()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          document.getElementById("solicitud-vehicular-file-input")?.click()
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "relative flex items-center justify-between gap-2.5 rounded-lg border border-dashed px-3 py-2 transition-all cursor-pointer",
                        isDragging
                          ? "border-primary bg-primary/10 shadow-xs"
                          : requiereRespaldoEstricto
                            ? "border-blue-300 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/10 hover:border-primary/50"
                            : "border-border/80 bg-muted/15 hover:border-primary/50 hover:bg-muted/25"
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
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                          <UploadCloud className="size-3.5" />
                        </div>

                        <p className="text-xs text-muted-foreground">
                          <label
                            htmlFor="solicitud-vehicular-file-input"
                            className="cursor-pointer text-primary underline underline-offset-2 hover:text-primary/80 font-semibold pointer-events-auto"
                          >
                            Selecciona archivos
                          </label>{" "}
                          o arrastra aquí (PDF, JPG, PNG máx 10MB)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Listado de archivos */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-1 pt-0.5">
                      <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <Paperclip className="size-3 text-primary" />
                        <span>Archivos ({selectedFiles.length})</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedFiles.map((file, idx) => (
                          <div
                            key={`${file.name}-${idx}`}
                            className="flex items-center justify-between gap-2 rounded-md bg-card px-2.5 py-1.5 border border-border/80 text-xs shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate min-w-0">
                              <FileText className="size-3.5 text-primary shrink-0" />
                              <div className="truncate min-w-0 flex items-center gap-1.5">
                                <p className="font-medium text-foreground truncate text-xs">
                                  {file.name}
                                </p>
                                <span className="text-[10px] text-muted-foreground">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => removeFile(idx)}
                              className="size-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded cursor-pointer shrink-0"
                              title="Remover"
                            >
                              <X className="size-3" />
                              <span className="sr-only">Remover</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Adjuntos guardados */}
                  {isEditing && existingAdjuntos && existingAdjuntos.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-border/50">
                      <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <Paperclip className="size-3 text-muted-foreground" />
                        <span>Adjuntos guardados ({existingAdjuntos.length})</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {existingAdjuntos.map((adj) => (
                          <div
                            key={adj.id}
                            className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5 border border-border/70 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate min-w-0">
                              <FileIcon className="size-3.5 text-muted-foreground shrink-0" />
                              <a
                                href={adj.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-primary hover:underline truncate text-xs"
                              >
                                {adj.nombreOriginal || adj.nombreArchivo}
                              </a>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">
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
