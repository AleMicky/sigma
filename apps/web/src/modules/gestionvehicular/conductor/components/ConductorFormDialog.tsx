import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  IdCard,
  Plus,
  Trash2,
} from "lucide-react"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { useCreateConductor, useUpdateConductor } from "../api/conductor.mutations"
import type { Conductor, ConductorLicencia, ConductorPayload } from "../api/conductor.service"
import {
  CATEGORIAS_LICENCIA,
  ESTADOS_CONDUCTOR,
  ESTADOS_LICENCIA,
  defaultConductorValues,
  defaultLicenciaValue,
  conductorSchema,
  type ConductorFormValues,
} from "../schemas/conductor.schema"

type ConductorFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  conductor?: Conductor | null
  onSuccess?: (conductor: Conductor) => void
}

function getCategoryColor(cat?: string | null) {
  const c = (cat || "").toUpperCase()
  switch (c) {
    case "M":
    case "P":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25"
    case "A":
      return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25"
    case "B":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25"
    case "C":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
    case "T":
      return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25"
    default:
      return "bg-primary/15 text-primary border-primary/25"
  }
}

export function ConductorFormDialog({
  open,
  onOpenChange,
  conductor,
  onSuccess,
}: ConductorFormDialogProps) {
  const isEditing = Boolean(conductor)
  const createMutation = useCreateConductor()
  const updateMutation = useUpdateConductor()
  const [formError, setFormError] = useState<string | null>(null)

  const initialValues: ConductorFormValues = conductor
    ? {
        empleadoId: conductor.empleadoId,
        estado: conductor.estado ?? "ACTIVO",
        observacion: conductor.observacion ?? "",
        activo: conductor.activo ?? true,
        licencias:
          conductor.licencias && conductor.licencias.length > 0
            ? conductor.licencias.map((l: ConductorLicencia) => ({
                id: l.id,
                categoriaLicencia: l.categoriaLicencia,
                numeroLicencia: l.numeroLicencia,
                fechaEmision: l.fechaEmision,
                fechaVencimiento: l.fechaVencimiento,
                estado: l.estado ?? "VIGENTE",
                observacion: l.observacion ?? "",
                nombreArchivo: l.nombreArchivo,
                nombreOriginal: l.nombreOriginal,
                url: l.url,
                mimeType: l.mimeType,
                size: l.size,
                activo: l.activo ?? true,
              }))
            : [defaultLicenciaValue],
      }
    : defaultConductorValues

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: conductorSchema,
      onSubmit: conductorSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload: ConductorPayload = {
          empleadoId: isEditing && conductor ? conductor.empleadoId : value.empleadoId,
          estado: value.estado,
          observacion: value.observacion?.trim() || null,
          activo: value.activo,
          licencias: value.licencias.map((lic) => ({
            id: lic.id,
            categoriaLicencia: lic.categoriaLicencia.trim().toUpperCase(),
            numeroLicencia: lic.numeroLicencia.trim().toUpperCase(),
            fechaEmision: lic.fechaEmision,
            fechaVencimiento: lic.fechaVencimiento,
            estado: lic.estado,
            observacion: lic.observacion?.trim() || null,
            nombreArchivo: lic.nombreArchivo || null,
            nombreOriginal: lic.nombreOriginal || null,
            url: lic.url || null,
            mimeType: lic.mimeType || null,
            size: lic.size || null,
            activo: lic.activo ?? true,
          })),
        }

        const saved = isEditing && conductor
          ? await updateMutation.mutateAsync({ id: conductor.id, payload })
          : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la información del conductor."
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Conductor" : "Registrar Nuevo Conductor"}
      description={
        isEditing
          ? "Gestiona el perfil del conductor y el detalle de sus licencias de conducir."
          : "Habilita a un empleado del personal institucional y registra sus licencias de conducir."
      }
      formError={formError}
      className="max-w-2xl sm:max-w-3xl"
      onCancel={() => {
        setFormError(null)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <FormDialogSubmit
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </form.Subscribe>
      }
    >
      <div className="flex flex-col gap-5 py-1">
        {/* SECCIÓN MAESTRO: DATOS PRINCIPALES */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IdCard className="size-3.5 text-primary" />
              Datos del Titular (Maestro)
            </span>
            {isEditing && (
              <Badge variant="outline" className="text-[10px] font-mono">
                ID: {conductor?.id.slice(0, 8)}…
              </Badge>
            )}
          </div>

          {/* 1. Empleado asignado */}
          <form.Field name="empleadoId">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    <RequiredFieldLabel>Empleado Titular</RequiredFieldLabel>
                  </FieldLabel>
                  <EmpleadoCombobox
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    disabled={isEditing}
                    placeholder="Selecciona el empleado de la institución…"
                  />
                  {isEditing && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      El empleado titular no puede modificarse una vez registrado.
                    </p>
                  )}
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 2. Estado Conductor */}
            <form.Field name="estado">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      <RequiredFieldLabel>Estado del Conductor</RequiredFieldLabel>
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val as any)}
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue placeholder="Selecciona estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_CONDUCTOR.map((est) => (
                          <SelectItem key={est.value} value={est.value}>
                            {est.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            {/* 3. Switch Activo */}
            <form.Field name="activo">
              {(field) => (
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3 h-full">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-foreground">
                      Conductor Habilitado
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Permitir asignaciones vehiculares
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.state.value}
                    onClick={() => field.handleChange(!field.state.value)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      field.state.value ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
                        field.state.value ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              )}
            </form.Field>
          </div>

          {/* 4. Observación Maestro */}
          <form.Field name="observacion">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Observaciones Generales</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={2}
                  placeholder="Notas adicionales o restricciones sobre el conductor…"
                  className="resize-none text-xs"
                />
              </Field>
            )}
          </form.Field>
        </div>

        {/* SECCIÓN DETALLE: LICENCIAS DE CONDUCIR (MAESTRO-DETALLE) */}
        <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
          <form.Field name="licencias" mode="array">
            {(licenciasField) => {
              const licencias = licenciasField.state.value || []
              const isInvalid =
                licenciasField.state.meta.isTouched &&
                !licenciasField.state.meta.isValid

              const addLicencia = () => {
                licenciasField.pushValue({
                  ...defaultLicenciaValue,
                  categoriaLicencia: "C",
                  numeroLicencia: "",
                  fechaEmision: new Date().toISOString().split("T")[0],
                  fechaVencimiento: "",
                  estado: "VIGENTE",
                })
              }

              const removeLicencia = (index: number) => {
                if (licencias.length <= 1) return
                licenciasField.removeValue(index)
              }

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5 text-primary" />
                        Licencias de Conducir (Detalle)
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.2">
                        {licencias.length} {licencias.length === 1 ? "licencia" : "licencias"}
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLicencia}
                      className="h-7 text-xs gap-1.5 rounded-lg border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary font-medium cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      Añadir Licencia
                    </Button>
                  </div>

                  {isInvalid && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-center gap-2">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{licenciasField.state.meta.errors?.[0] ? String(licenciasField.state.meta.errors[0]) : "Debe registrar al menos una licencia válida"}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {licencias.map((_, index) => {
                      const lic = licencias[index]
                      const catTheme = getCategoryColor(lic?.categoriaLicencia)

                      // Calcular vencimiento
                      let vencimientoInfo: { text: string; color: string; icon: any } | null = null
                      if (lic?.fechaVencimiento) {
                        const hoy = new Date()
                        hoy.setHours(0, 0, 0, 0)
                        const diffDays = Math.ceil(
                          (new Date(lic.fechaVencimiento).getTime() - hoy.getTime()) / 86_400_000
                        )
                        if (diffDays < 0) {
                          vencimientoInfo = {
                            text: `Vencida hace ${Math.abs(diffDays)} días`,
                            color: "text-destructive bg-destructive/10 border-destructive/30",
                            icon: AlertTriangle,
                          }
                        } else if (diffDays <= 30) {
                          vencimientoInfo = {
                            text: `Vence en ${diffDays} días`,
                            color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
                            icon: Clock,
                          }
                        } else {
                          vencimientoInfo = {
                            text: `Vigente (${diffDays} días)`,
                            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
                            icon: CheckCircle2,
                          }
                        }
                      }

                      return (
                        <div
                          key={index}
                          className="relative rounded-xl border border-border/80 bg-background/80 p-3.5 space-y-3 shadow-2xs hover:border-primary/40 transition-colors"
                        >
                          {/* Top bar of license card */}
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "inline-flex size-6 items-center justify-center rounded-lg font-bold text-[10px] border shadow-2xs",
                                  catTheme
                                )}
                              >
                                {lic?.categoriaLicencia || "C"}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                Licencia #{index + 1}
                              </span>
                              {vencimientoInfo && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "gap-1 text-[10px] font-medium border px-1.5 py-0.2",
                                    vencimientoInfo.color
                                  )}
                                >
                                  <vencimientoInfo.icon className="size-2.5 shrink-0" />
                                  {vencimientoInfo.text}
                                </Badge>
                              )}
                            </div>

                            {licencias.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeLicencia(index)}
                                className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                                title="Eliminar esta licencia"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>

                          {/* License Form Fields Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {/* 1. Categoría */}
                            <form.Field name={`licencias[${index}].categoriaLicencia`}>
                              {(catField) => (
                                <Field>
                                  <FieldLabel htmlFor={catField.name}>
                                    <RequiredFieldLabel>Categoría</RequiredFieldLabel>
                                  </FieldLabel>
                                  <Select
                                    value={catField.state.value}
                                    onValueChange={(val) => catField.handleChange(val ?? "")}
                                  >
                                    <SelectTrigger id={catField.name} className="h-8 text-xs">
                                      <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CATEGORIAS_LICENCIA.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                          {cat.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </Field>
                              )}
                            </form.Field>

                            {/* 2. Nº de Licencia */}
                            <form.Field name={`licencias[${index}].numeroLicencia`}>
                              {(numField) => {
                                const isInvalid = numField.state.meta.isTouched && !numField.state.meta.isValid
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={numField.name}>
                                      <RequiredFieldLabel>Nº Licencia</RequiredFieldLabel>
                                    </FieldLabel>
                                    <div className="relative">
                                      <IdCard className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        id={numField.name}
                                        name={numField.name}
                                        value={numField.state.value}
                                        onChange={(e) => numField.handleChange(e.target.value.toUpperCase())}
                                        onBlur={numField.handleBlur}
                                        placeholder="Ej. 1234567-LP"
                                        className="h-8 pl-8 font-mono text-xs uppercase"
                                        aria-invalid={isInvalid}
                                      />
                                    </div>
                                    {isInvalid && <FieldError errors={numField.state.meta.errors} />}
                                  </Field>
                                )
                              }}
                            </form.Field>

                            {/* 3. Fecha Emisión */}
                            <form.Field name={`licencias[${index}].fechaEmision`}>
                              {(emiField) => {
                                const isInvalid = emiField.state.meta.isTouched && !emiField.state.meta.isValid
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={emiField.name}>
                                      <RequiredFieldLabel>Emisión</RequiredFieldLabel>
                                    </FieldLabel>
                                    <div className="relative">
                                      <Calendar className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        id={emiField.name}
                                        name={emiField.name}
                                        type="date"
                                        value={emiField.state.value}
                                        onChange={(e) => emiField.handleChange(e.target.value)}
                                        onBlur={emiField.handleBlur}
                                        className="h-8 pl-8 text-xs"
                                        aria-invalid={isInvalid}
                                      />
                                    </div>
                                  </Field>
                                )
                              }}
                            </form.Field>

                            {/* 4. Fecha Vencimiento */}
                            <form.Field name={`licencias[${index}].fechaVencimiento`}>
                              {(vencField) => {
                                const isInvalid = vencField.state.meta.isTouched && !vencField.state.meta.isValid
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={vencField.name}>
                                      <RequiredFieldLabel>Vencimiento</RequiredFieldLabel>
                                    </FieldLabel>
                                    <div className="relative">
                                      <Calendar className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                      <Input
                                        id={vencField.name}
                                        name={vencField.name}
                                        type="date"
                                        value={vencField.state.value}
                                        onChange={(e) => vencField.handleChange(e.target.value)}
                                        onBlur={vencField.handleBlur}
                                        className="h-8 pl-8 text-xs"
                                        aria-invalid={isInvalid}
                                      />
                                    </div>
                                    {isInvalid && <FieldError errors={vencField.state.meta.errors} />}
                                  </Field>
                                )
                              }}
                            </form.Field>
                          </div>

                          {/* Row 2 of License: Estado & Observación */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <form.Field name={`licencias[${index}].estado`}>
                              {(estLicField) => (
                                <Field>
                                  <FieldLabel htmlFor={estLicField.name}>Estado Licencia</FieldLabel>
                                  <Select
                                    value={estLicField.state.value}
                                    onValueChange={(val) => estLicField.handleChange(val as any)}
                                  >
                                    <SelectTrigger id={estLicField.name} className="h-8 text-xs">
                                      <SelectValue placeholder="Estado Licencia" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ESTADOS_LICENCIA.map((est) => (
                                        <SelectItem key={est.value} value={est.value} className="text-xs">
                                          {est.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </Field>
                              )}
                            </form.Field>

                            <div className="sm:col-span-2">
                              <form.Field name={`licencias[${index}].observacion`}>
                                {(obsField) => (
                                  <Field>
                                    <FieldLabel htmlFor={obsField.name}>Observación de la Licencia</FieldLabel>
                                    <Input
                                      id={obsField.name}
                                      name={obsField.name}
                                      value={obsField.state.value ?? ""}
                                      onChange={(e) => obsField.handleChange(e.target.value)}
                                      onBlur={obsField.handleBlur}
                                      placeholder="Ej. Renovación tramitada en SEGIP La Paz…"
                                      className="h-8 text-xs"
                                    />
                                  </Field>
                                )}
                              </form.Field>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }}
          </form.Field>
        </div>
      </div>
    </FormDialog>
  )
}
