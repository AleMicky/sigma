import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { useCreateFlota, useUpdateFlota } from "../api/flota.mutations"
import type { FlotaVehicular } from "../api/flota.service"
import {
  type FlotaFormValues,
  flotaFormSchema,
} from "../schemas/flota.schema"

interface FlotaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flota?: FlotaVehicular | null
  onSuccess?: (saved: FlotaVehicular) => void
}

export function FlotaFormDialog({
  open,
  onOpenChange,
  flota,
  onSuccess,
}: FlotaFormDialogProps) {
  const isEditing = Boolean(flota)
  const createMutation = useCreateFlota()
  const updateMutation = useUpdateFlota()
  const [formError, setFormError] = useState<string | null>(null)

  const initialValues: FlotaFormValues = flota
    ? {
        codigo: flota.codigo,
        nombre: flota.nombre,
        descripcion: flota.descripcion ?? "",
        activo: flota.activo ?? true,
      }
    : {
        codigo: "",
        nombre: "",
        descripcion: "",
        activo: true,
      }

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: flotaFormSchema,
      onSubmit: flotaFormSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          codigo: value.codigo,
          nombre: value.nombre,
          descripcion: value.descripcion?.trim() || null,
          activo: value.activo,
        }

        const saved = isEditing && flota
          ? await updateMutation.mutateAsync({ id: flota.id, data: payload })
          : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la información de la flota vehicular."
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Flota Vehicular" : "Nueva Flota Vehicular"}
      description={
        isEditing
          ? "Actualiza los datos principales de la flota vehicular."
          : "Ingresa los datos para registrar una nueva flota en el sistema."
      }
      formError={formError}
      className="max-w-md sm:max-w-lg"
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
      <div className="space-y-4 py-1">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Código */}
          <form.Field name="codigo">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid} className="sm:col-span-1">
                  <FieldLabel htmlFor={field.name}>
                    <RequiredFieldLabel>Código</RequiredFieldLabel>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    onBlur={field.handleBlur}
                    placeholder="Ej. FLT-01"
                    className="font-mono uppercase text-xs"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          {/* Nombre */}
          <form.Field name="nombre">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid} className="sm:col-span-2">
                  <FieldLabel htmlFor={field.name}>
                    <RequiredFieldLabel>Nombre de la Flota</RequiredFieldLabel>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Ej. Flota Operaciones Central"
                    className="text-xs"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>

        {/* Descripción */}
        <form.Field name="descripcion">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                rows={3}
                placeholder="Propósito, zona o detalles operativos de esta flota…"
                className="resize-none text-xs"
              />
            </Field>
          )}
        </form.Field>

        {/* Switch Activo */}
        <form.Field name="activo">
          {(field) => (
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  Flota Habilitada
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Disponible para asignaciones vehiculares y solicitudes
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={field.state.value}
                onClick={() => field.handleChange(!field.state.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500",
                  field.state.value ? "bg-cyan-600" : "bg-muted-foreground/30"
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
    </FormDialog>
  )
}
