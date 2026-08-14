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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

import {
  useCreateUbicacion,
  useUpdateUbicacion,
} from "../api/ubicacion.mutations"
import type { TipoUbicacion, Ubicacion } from "../api/ubicacion.service"
import {
  defaultUbicacionValues,
  ubicacionSchema,
} from "../schemas/ubicacion.schema"
import { TIPO_UBICACION_CONFIG } from "./TipoUbicacionBadge"
import { UbicacionMapPicker } from "./map/UbicacionMapPicker"

const NONE_PARENT = "__none__"

type UbicacionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ubicacion?: Ubicacion | null
  parentLocationId?: string | null
  availableLocations?: Ubicacion[]
  onSuccess?: (ubicacion: Ubicacion) => void
}

export function UbicacionFormDialog({
  open,
  onOpenChange,
  ubicacion,
  parentLocationId,
  availableLocations = [],
  onSuccess,
}: UbicacionFormDialogProps) {
  const isEditing = Boolean(ubicacion)
  const createMutation = useCreateUbicacion()
  const updateMutation = useUpdateUbicacion()
  const [formError, setFormError] = useState<string | null>(null)

  const tiposKeys = Object.keys(TIPO_UBICACION_CONFIG) as TipoUbicacion[]

  // Filter out self from available parent choices when editing
  const filteredParents = availableLocations.filter(
    (loc) => !isEditing || loc.id !== ubicacion?.id,
  )

  const initialParentId =
    ubicacion?.ubicacionPadreId ?? parentLocationId ?? NONE_PARENT

  const form = useForm({
    defaultValues: ubicacion
      ? {
          codigo: ubicacion.codigo,
          nombre: ubicacion.nombre,
          descripcion: ubicacion.descripcion ?? "",
          tipo: ubicacion.tipo,
          ubicacionPadreId: initialParentId,
          direccion: ubicacion.direccion ?? "",
          latitud: ubicacion.latitud ?? (null as number | null),
          longitud: ubicacion.longitud ?? (null as number | null),
        }
      : {
          ...defaultUbicacionValues,
          ubicacionPadreId: initialParentId,
        },
    validators: {
      onSubmit: ubicacionSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      const parentId =
        value.ubicacionPadreId && value.ubicacionPadreId !== NONE_PARENT
          ? value.ubicacionPadreId
          : null

      try {
        const saved =
          isEditing && ubicacion
            ? await updateMutation.mutateAsync({
                id: ubicacion.id,
                payload: {
                  codigo: value.codigo.trim(),
                  nombre: value.nombre.trim(),
                  descripcion: value.descripcion?.trim() || null,
                  tipo: value.tipo as TipoUbicacion,
                  ubicacionPadreId: parentId,
                  direccion: value.direccion?.trim() || null,
                  latitud: value.latitud ? Number(value.latitud) : null,
                  longitud: value.longitud ? Number(value.longitud) : null,
                },
              })
            : await createMutation.mutateAsync({
                codigo: value.codigo.trim(),
                nombre: value.nombre.trim(),
                descripcion: value.descripcion?.trim() || null,
                tipo: value.tipo as TipoUbicacion,
                ubicacionPadreId: parentId,
                direccion: value.direccion?.trim() || null,
                latitud: value.latitud ? Number(value.latitud) : null,
                longitud: value.longitud ? Number(value.longitud) : null,
              })

        onSuccess?.(saved)
        onOpenChange(false)
        form.reset()
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo guardar la ubicación.",
        )
      }
    },
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar ubicación" : "Nueva ubicación"}
      description={
        isEditing
          ? "Modifica el código, nombre, tipo o datos geográficos de la ubicación."
          : "Registra una nueva ubicación jerárquica en el sistema."
      }
      formError={formError}
      onCancel={() => {
        setFormError(null)
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  placeholder="BOG-ED1"
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
                  placeholder="Edificio Principal Bogotá"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="tipo">
          {(field) => (
            <Field>
              <RequiredFieldLabel htmlFor={field.name}>
                Tipo de Ubicación
              </RequiredFieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val as TipoUbicacion)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposKeys.map((key) => {
                    const cfg = TIPO_UBICACION_CONFIG[key]
                    const Icon = cfg.icon
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span>{cfg.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="ubicacionPadreId">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Ubicación Padre</FieldLabel>
              <Select
                value={field.state.value ?? NONE_PARENT}
                onValueChange={(val) => field.handleChange(val ?? NONE_PARENT)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Sin ubicación padre (Nodo Raíz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PARENT}>
                    <span className="italic font-medium text-muted-foreground">
                      Sin ubicación padre (Nodo Raíz)
                    </span>
                  </SelectItem>
                  {filteredParents.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      <div className="flex items-center gap-1.5 truncate">
                        <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                          {loc.codigo}
                        </code>
                        <span className="truncate">{loc.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>
      </div>

      <form.Field name="direccion">
        {(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <FieldLabel htmlFor={field.name}>Dirección Física</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Av. Eléctrica 25-67, Piso 3"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>

      {/* Interactive Map Picker Section */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Selección Geográfica en Mapa (Leaflet)</FieldLabel>
        <form.Subscribe
          selector={(state) => [
            state.values.latitud,
            state.values.longitud,
            state.values.tipo,
          ] as const}
        >
          {([lat, lng, tipoVal]) => (
            <UbicacionMapPicker
              latitud={lat ?? null}
              longitud={lng ?? null}
              tipo={tipoVal as TipoUbicacion}
              onChangeCoords={(newLat, newLng) => {
                form.setFieldValue("latitud", newLat)
                form.setFieldValue("longitud", newLng)
              }}
            />
          )}
        </form.Subscribe>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="latitud">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Latitud GPS</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step="any"
                min="-90"
                max="90"
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                placeholder="4.7110"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="longitud">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Longitud GPS</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step="any"
                min="-180"
                max="180"
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                placeholder="-74.0721"
              />
            </Field>
          )}
        </form.Field>
      </div>

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
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Detalles adicionales u observaciones de la ubicación"
                rows={2}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      </form.Field>
    </FormDialog>
  )
}
