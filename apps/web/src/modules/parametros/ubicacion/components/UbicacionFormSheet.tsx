import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Crosshair, Loader2, MapPin, Save } from "lucide-react"

import { toast } from "sonner"

import { isApiError } from "@/shared/api"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
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
import { UbicacionMapPickerModal } from "./map/UbicacionMapPickerModal"

const NONE_PARENT = "__none__"

type UbicacionFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ubicacion?: Ubicacion | null
  parentLocationId?: string | null
  availableLocations?: Ubicacion[]
  onSuccess?: (ubicacion: Ubicacion) => void
}

export function UbicacionFormSheet({
  open,
  onOpenChange,
  ubicacion,
  parentLocationId,
  availableLocations = [],
  onSuccess,
}: UbicacionFormSheetProps) {
  const isEditing = Boolean(ubicacion)
  const createMutation = useCreateUbicacion()
  const updateMutation = useUpdateUbicacion()
  const [formError, setFormError] = useState<string | null>(null)

  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

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

  // Quick geolocation shortcut from browser navigator
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización.")
      return
    }

    setIsLocating(true)

    const applyPos = (pos: GeolocationPosition) => {
      setIsLocating(false)
      form.setFieldValue("latitud", Number(pos.coords.latitude.toFixed(6)))
      form.setFieldValue("longitud", Number(pos.coords.longitude.toFixed(6)))
      toast.success("Coordenadas GPS obtenidas correctamente.")
    }

    // Try high accuracy first, fallback to standard Wi-Fi/IP location if timeout
    navigator.geolocation.getCurrentPosition(
      applyPos,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setIsLocating(false)
          toast.error("Permiso de ubicación denegado en el navegador o sistema.")
        } else {
          // Retry with low accuracy (Wi-Fi/IP location for laptops without hardware GPS)
          navigator.geolocation.getCurrentPosition(
            applyPos,
            () => {
              setIsLocating(false)
              toast.error(
                "No se pudo obtener la ubicación. Comprueba que la ubicación esté activada en la configuración de tu navegador/sistema.",
              )
            },
            { enableHighAccuracy: false, timeout: 10000 },
          )
        }
      },
      { enableHighAccuracy: true, timeout: 5000 },
    )
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl data-[side=right]:lg:max-w-3xl p-0 flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <SheetHeader className="p-6 border-b bg-muted/20">
            <SheetTitle className="text-xl font-bold">
              {isEditing ? "Editar Ubicación" : "Nueva Ubicación"}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
              {isEditing
                ? "Modifica el código, nombre, ubicación padre o coordenadas geográficas."
                : "Completa la información para registrar una nueva ubicación en el sistema."}
            </SheetDescription>
          </SheetHeader>

          {/* Form Body */}
          <form
            id="ubicacion-sheet-form"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-4"
          >
            {formError ? (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs font-medium text-destructive">
                {formError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <form.Field name="codigo">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid || undefined}>
                      <FieldLabel htmlFor={field.name}>
                        Código <span className="text-destructive">*</span>
                      </FieldLabel>
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
                      <FieldLabel htmlFor={field.name}>
                        Nombre <span className="text-destructive">*</span>
                      </FieldLabel>
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
                {(field) => {
                  const selectedCfg =
                    TIPO_UBICACION_CONFIG[field.state.value as TipoUbicacion]
                  const SelectedIcon = selectedCfg?.icon

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Tipo de Ubicación <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) =>
                          field.handleChange(val as TipoUbicacion)
                        }
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder="Selecciona un tipo">
                            {selectedCfg && SelectedIcon ? (
                              <div className="flex items-center gap-2 truncate">
                                <SelectedIcon className="size-3.5 text-muted-foreground shrink-0" />
                                <span>{selectedCfg.label}</span>
                              </div>
                            ) : null}
                          </SelectValue>
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
                  )
                }}
              </form.Field>

              <form.Field name="ubicacionPadreId">
                {(field) => {
                  const selectedParent = availableLocations.find(
                    (loc) => loc.id === field.state.value,
                  )

                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Ubicación Padre</FieldLabel>
                      <Select
                        value={field.state.value ?? NONE_PARENT}
                        onValueChange={(val) =>
                          field.handleChange(val ?? NONE_PARENT)
                        }
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder="Sin ubicación padre (Nodo Raíz)">
                            {!field.state.value ||
                            field.state.value === NONE_PARENT ? (
                              <span className="italic font-medium text-muted-foreground truncate">
                                Sin ubicación padre (Nodo Raíz)
                              </span>
                            ) : selectedParent ? (
                              <div className="flex items-center gap-1.5 truncate">
                                <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                                  {selectedParent.codigo}
                                </code>
                                <span className="truncate">
                                  {selectedParent.nombre}
                                </span>
                              </div>
                            ) : null}
                          </SelectValue>
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
                  )
                }}
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

            {/* Geolocation Controls Section */}
            <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Coordenadas Geográficas (GPS)
                </span>

                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="gap-1 text-[11px] text-primary border-primary/30 hover:bg-primary/10"
                >
                  {isLocating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Crosshair className="size-3" />
                  )}
                  <span>GPS actual</span>
                </Button>
              </div>

              <form.Subscribe
                selector={(state) => [
                  state.values.latitud,
                  state.values.longitud,
                ] as const}
              >
                {([lat, lng]) => (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {lat !== null && lng !== null ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary truncate">
                          <MapPin className="size-3.5 shrink-0" />
                          <span>{lat}, {lng}</span>
                        </span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">
                          Sin coordenadas seleccionadas
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setMapModalOpen(true)}
                      className="gap-1.5 shrink-0 text-xs"
                    >
                      <MapPin className="size-3.5 text-primary" />
                      <span>Abrir Mapa de Geolocalización</span>
                    </Button>
                  </div>
                )}
              </form.Subscribe>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <form.Field name="latitud">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-[11px]">
                        Latitud
                      </FieldLabel>
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
                        className="h-8 text-xs font-mono"
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="longitud">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name} className="text-[11px]">
                        Longitud
                      </FieldLabel>
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
                        className="h-8 text-xs font-mono"
                      />
                    </Field>
                  )}
                </form.Field>
              </div>
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
                      rows={3}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </form>

          {/* Footer Actions */}
          <SheetFooter className="p-4 border-t bg-card flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="ubicacion-sheet-form"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{isEditing ? "Guardar Cambios" : "Crear Ubicación"}</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Dedicated Map Selection Modal */}
      <form.Subscribe
        selector={(state) => [
          state.values.latitud,
          state.values.longitud,
          state.values.tipo,
          state.values.direccion,
        ] as const}
      >
        {([lat, lng, tipoVal, dirVal]) => (
          <UbicacionMapPickerModal
            open={mapModalOpen}
            onOpenChange={setMapModalOpen}
            initialLat={lat ?? null}
            initialLng={lng ?? null}
            tipo={tipoVal as TipoUbicacion}
            direccion={dirVal ?? ""}
            onConfirmCoords={(newLat, newLng) => {
              form.setFieldValue("latitud", newLat)
              form.setFieldValue("longitud", newLng)
            }}
          />
        )}
      </form.Subscribe>
    </>
  )
}
