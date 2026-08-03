import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"

import { isApiError } from "@/shared/api"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { ImageUploadField } from "@/shared/components/image-upload-field"
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
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"

import { activoKeys } from "../api/activo.keys"
import {
  useCreateActivo,
  useUpdateActivo,
} from "../api/activo.mutations"
import {
  deleteActivoImagen,
  uploadActivoImagen,
  type Activo,
} from "../api/activo.service"
import { activoSchema, defaultActivoValues } from "../schemas/activo.schema"

type ActivoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activo?: Activo | null
  defaultTipoActivoId?: string
  onSuccess?: () => void
}

export function ActivoFormDialog({
  open,
  onOpenChange,
  activo,
  defaultTipoActivoId,
  onSuccess,
}: ActivoFormDialogProps) {
  const isEditing = Boolean(activo)
  const queryClient = useQueryClient()
  const createMutation = useCreateActivo()
  const updateMutation = useUpdateActivo()
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)

  const tiposQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tipos = tiposQuery.data?.content ?? []
  const tiposById = useMemo(
    () => new Map(tipos.map((tipo) => [tipo.id, tipo])),
    [tipos],
  )

  const form = useForm({
    defaultValues: activo
      ? {
          codigo: activo.codigo,
          nombre: activo.nombre,
          descripcion: activo.descripcion ?? "",
          tipoActivoId: activo.tipoActivoId,
          ubicacion: activo.ubicacion ?? "",
          fechaAdquisicion: activo.fechaAdquisicion ?? "",
        }
      : {
          ...defaultActivoValues,
          tipoActivoId: defaultTipoActivoId ?? "",
        },
    validators: {
      onSubmit: activoSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const payload = {
        codigo: value.codigo.trim(),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        tipoActivoId: value.tipoActivoId,
        ubicacion: value.ubicacion.trim() || null,
        fechaAdquisicion: value.fechaAdquisicion || null,
      }

      try {
        let savedId = activo?.id

        if (isEditing && activo) {
          await updateMutation.mutateAsync({
            id: activo.id,
            payload,
          })
        } else {
          const created = await createMutation.mutateAsync(payload)
          savedId = created.id
        }

        if (savedId && pendingFile) {
          await uploadActivoImagen(savedId, pendingFile)
          void queryClient.invalidateQueries({ queryKey: activoKeys.lists() })
        } else if (savedId && removeExistingImage && activo?.urlImagen) {
          await deleteActivoImagen(savedId)
          void queryClient.invalidateQueries({ queryKey: activoKeys.lists() })
        }

        onSuccess?.()
        onOpenChange(false)
        form.reset()
        setPendingFile(null)
        setRemoveExistingImage(false)
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar el activo.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={isEditing ? "Editar activo" : "Crear activo"}
      description={
        isEditing
          ? "Actualiza los datos del activo."
          : "Registra un nuevo activo del inventario."
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
        setPendingFile(null)
        setRemoveExistingImage(false)
        form.reset()
      }}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) =>
            [state.canSubmit, state.isSubmitting] as const
          }
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
      <ImageUploadField
        currentUrl={activo?.urlImagen}
        file={pendingFile}
        onFileChange={setPendingFile}
        removeExisting={removeExistingImage}
        onRemoveExistingChange={setRemoveExistingImage}
      />

      <form.Field name="tipoActivoId">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          const selected = tiposById.get(field.state.value)

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Tipo de activo
              </RequiredFieldLabel>
              <Select
                value={field.state.value || null}
                onValueChange={(value) =>
                  field.handleChange(value ?? "")
                }
                disabled={tiposQuery.isLoading}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={isInvalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Selecciona un tipo">
                    {selected?.nombre ?? null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="codigo">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Código
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="VEH-001"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="nombre">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Nombre
              </RequiredFieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                required
                aria-required
                aria-invalid={isInvalid}
                placeholder="Toyota Hilux"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Camioneta de operaciones"
                rows={2}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="ubicacion">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>Ubicación</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Sede central"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="fechaAdquisicion">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  Fecha de adquisición
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>
    </FormDialog>
  )
}
