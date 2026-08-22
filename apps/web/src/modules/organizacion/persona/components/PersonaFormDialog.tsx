import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Calendar, FileText, Mail, Phone, User } from "lucide-react"

import { isApiError } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

import { useCreatePersona, useUpdatePersona } from "../api/persona.mutations"
import type { Persona } from "../api/persona.service"
import { defaultPersonaValues, personaSchema } from "../schemas/persona.schema"

type PersonaFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  persona?: Persona | null
  onSuccess?: (persona: Persona) => void
}

export function PersonaFormDialog({
  open,
  onOpenChange,
  persona,
  onSuccess,
}: PersonaFormDialogProps) {
  const isEditing = Boolean(persona)
  const createMutation = useCreatePersona()
  const updateMutation = useUpdatePersona()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: persona
      ? {
          tipoDocumento: persona.tipoDocumento,
          numeroDocumento: persona.numeroDocumento,
          complemento: persona.complemento ?? "",
          nombres: persona.nombres,
          primerApellido: persona.primerApellido,
          segundoApellido: persona.segundoApellido ?? "",
          fechaNacimiento: persona.fechaNacimiento ?? "",
          telefono: persona.telefono ?? "",
          correo: persona.correo ?? "",
        }
      : defaultPersonaValues,
    validators: {
      onSubmit: personaSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const payload = {
          tipoDocumento: value.tipoDocumento.trim().toUpperCase(),
          numeroDocumento: value.numeroDocumento.trim(),
          complemento: value.complemento?.trim() || null,
          nombres: value.nombres.trim(),
          primerApellido: value.primerApellido.trim(),
          segundoApellido: value.segundoApellido?.trim() || null,
          fechaNacimiento: value.fechaNacimiento || null,
          telefono: value.telefono?.trim() || null,
          correo: value.correo?.trim() || null,
        }

        const saved =
          isEditing && persona
            ? await updateMutation.mutateAsync({
                id: persona.id,
                payload,
              })
            : await createMutation.mutateAsync(payload)

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error) ? error.message : "No se pudo guardar la persona.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar persona" : "Nueva persona natural"}
      description={
        isEditing
          ? "Actualiza los datos biográficos, documento o contacto de la persona."
          : "Registra una nueva persona natural en el catálogo maestro."
      }
      formError={formError}
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
      {/* Sección 1: Documento de Identidad */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <FileText className="size-4 text-primary" />
          <span>Documento de Identidad</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <form.Field name="tipoDocumento">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Tipo Documento
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    required
                    placeholder="Ej. CI, DNI, PAS"
                    className="uppercase"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="numeroDocumento">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Nro. Documento
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    placeholder="Ej. 12345678"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="complemento">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Complemento</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    placeholder="Ej. 1A (Opcional)"
                    className="uppercase"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>
      </div>

      {/* Sección 2: Nombres y Apellidos */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <User className="size-4 text-primary" />
          <span>Datos Personales</span>
        </div>

        <form.Field name="nombres">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Nombres
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  placeholder="Ej. Juan Carlos"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="primerApellido">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Primer Apellido
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    placeholder="Ej. Pérez"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="segundoApellido">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Segundo Apellido</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej. Gómez (Opcional)"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>
      </div>

      {/* Sección 3: Contacto y Nacimiento */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 sm:p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Phone className="size-4 text-primary" />
          <span>Contacto y Fecha de Nacimiento</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <form.Field name="fechaNacimiento">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name} className="gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>F. Nacimiento</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="telefono">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name} className="gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>Teléfono</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+591 77712345"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="correo">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name} className="gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>Correo</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="juan@ejemplo.com"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>
      </div>

      {isEditing && persona ? (
        <div className="pt-2 border-t">
          <AuditInfo data={persona} />
        </div>
      ) : null}
    </FormDialog>
  )
}

