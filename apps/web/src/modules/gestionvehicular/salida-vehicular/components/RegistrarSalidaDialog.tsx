import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react"

import { vehiculoQueries } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.queries"
import type { VehiculoCatalogo } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.types"
import {
  getPlacaFromAtributos,
  getVehiculoTituloDinamico,
} from "@/modules/gestionvehicular/vehiculo/lib/vehiculo-atributos.utils"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { isApiError } from "@/shared/api"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { FormDialog, RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { cn } from "@/shared/lib/utils"

import { useRegistrarSalidaMutation } from "../api/salida-vehicular.mutations"
import type { SalidaVehicular } from "../api/salida-vehicular.types"
import { VehiculoPreventivoWidget } from "./VehiculoPreventivoWidget"
import {
  defaultRegistrarSalidaValues,
  getLocalCurrentIsoString,
  registrarSalidaSchema,
} from "../schemas/salida-vehicular.schema"

interface RegistrarSalidaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (salida: SalidaVehicular) => void
}

export function RegistrarSalidaDialog({
  open,
  onOpenChange,
  onSuccess,
}: RegistrarSalidaDialogProps) {
  const [selectedVehiculo, setSelectedVehiculo] =
    useState<VehiculoCatalogo | null>(null)
  const [vehiculoSearch, setVehiculoSearch] = useState("")
  const [vehiculoPage, setVehiculoPage] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const debouncedVehiculoSearch = useDebouncedValue(vehiculoSearch, 250)

  const [prevVehiculoSearch, setPrevVehiculoSearch] = useState(debouncedVehiculoSearch)

  if (prevVehiculoSearch !== debouncedVehiculoSearch) {
    setPrevVehiculoSearch(debouncedVehiculoSearch)
    setVehiculoPage(0)
  }

  const registrarMutation = useRegistrarSalidaMutation()

  const form = useForm({
    defaultValues: defaultRegistrarSalidaValues,
    validators: {
      onChange: registrarSalidaSchema,
      onSubmit: registrarSalidaSchema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null)

      try {
        const created = await registrarMutation.mutateAsync({
          activoId: value.activoId,
          empleadoId: value.empleadoId,
          fecha: value.fecha ? new Date(value.fecha).toISOString() : new Date().toISOString(),
          descripcionActividad: value.descripcionActividad.trim(),
          observaciones: value.observaciones.trim() || undefined,
        })

        handleReset()
        onOpenChange(false)
        onSuccess?.(created)
      } catch (error) {
        setFormError(
          isApiError(error)
            ? error.message
            : "No se pudo registrar la salida vehicular."
        )
      }
    },
  })

  const formActivoId = useStore(form.store, (state) => state.values.activoId)

  // Fetch paginado de vehículos desde el endpoint propio de gestión vehicular
  const vehiculosQuery = useQuery(
    vehiculoQueries.list({
      page: vehiculoPage,
      size: 10,
      q: debouncedVehiculoSearch || undefined,
      activo: true,
      sortBy: "nombre",
      direction: "ASC",
    })
  )

  const vehiculos = useMemo(
    () => vehiculosQuery.data?.content ?? [],
    [vehiculosQuery.data?.content]
  )
  const totalPages = vehiculosQuery.data?.totalPages ?? 1
  const totalElements = vehiculosQuery.data?.totalElements ?? vehiculos.length

  const singleVehiculoQuery = useQuery({
    ...vehiculoQueries.detail(formActivoId),
    enabled: Boolean(formActivoId && !selectedVehiculo),
  })

  const currentVehiculo = selectedVehiculo ?? singleVehiculoQuery.data ?? null
  const currentPlaca = currentVehiculo
    ? getPlacaFromAtributos(currentVehiculo).valor
    : null
  const currentTitulo = currentVehiculo
    ? getVehiculoTituloDinamico(currentVehiculo)
    : ""

  const handleReset = useCallback(() => {
    setFormError(null)
    setSelectedVehiculo(null)
    setVehiculoSearch("")
    setVehiculoPage(0)
    form.reset({
      ...defaultRegistrarSalidaValues,
      fecha: getLocalCurrentIsoString(),
    })
  }, [form])

  useEffect(() => {
    if (open) {
      handleReset()
    }
  }, [open, handleReset])

  const handleVehiculoRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    void vehiculosQuery.refetch()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar Nueva Salida Vehicular"
      description="Complete los datos del viaje para registrar la salida e iniciar el proceso de flujo BPMN."
      size="md"
      formError={formError}
      onCancel={handleReset}
      onSubmit={() => form.handleSubmit()}
      footer={
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || registrarMutation.isPending}
              className="gap-1.5 cursor-pointer"
            >
              {isSubmitting || registrarMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Iniciando proceso…</span>
                </>
              ) : (
                <>
                  <Car className="size-4" />
                  <span>Registrar e Iniciar</span>
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      }
    >
      <div className="flex flex-col gap-4 py-1">
        {/* 1. Vehículo */}
        <form.Field name="activoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor="vehiculo">
                  Vehículo Asignado
                </RequiredFieldLabel>

                {currentVehiculo ? (
                  <div className="flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background/95 px-3 py-2 min-h-10 shadow-2xs hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative size-8 rounded-lg border border-border/80 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                        {currentVehiculo.urlImagen ? (
                          <AuthenticatedImage
                            src={currentVehiculo.urlImagen}
                            alt={currentTitulo}
                            className="size-full object-cover"
                            fallback={
                              <Car className="size-4 text-muted-foreground" />
                            }
                          />
                        ) : (
                          <Car className="size-4 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {currentPlaca ? (
                            <span className="font-mono text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-cyan-500/12 text-foreground shrink-0 uppercase">
                              {currentPlaca}
                            </span>
                          ) : null}
                          {currentTitulo !== currentPlaca ? (
                            <span className="font-semibold text-xs text-foreground truncate leading-snug">
                              {currentTitulo}
                            </span>
                          ) : null}
                          {currentVehiculo.estadoOperativo?.nombre ? (
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded border inline-flex items-center gap-1 shrink-0"
                              style={{
                                backgroundColor: `${currentVehiculo.estadoOperativo.color || "#10b981"}18`,
                                color: currentVehiculo.estadoOperativo.color || "#10b981",
                                borderColor: `${currentVehiculo.estadoOperativo.color || "#10b981"}40`,
                              }}
                            >
                              <span
                                className="size-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    currentVehiculo.estadoOperativo.color || "#10b981",
                                }}
                              />
                              {currentVehiculo.estadoOperativo.nombre}
                            </span>
                          ) : null}
                        </div>
                        {currentVehiculo.ubicacion?.nombre ? (
                          <p className="text-[11px] text-muted-foreground truncate leading-snug">
                            {currentVehiculo.ubicacion.nombre}
                          </p>
                        ) : null}
                        {/* Estado Preventivo en la selección de vehículo */}
                        <VehiculoPreventivoWidget
                          activoId={currentVehiculo.id}
                          variant="inline"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        field.handleChange("")
                        setSelectedVehiculo(null)
                      }}
                      className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md shrink-0 cursor-pointer"
                      title="Cambiar vehículo seleccionado"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Combobox
                    items={vehiculos}
                    filter={() => true}
                    itemToStringLabel={(item: VehiculoCatalogo) => {
                      if (!item) return ""
                      const { valor: placa } = getPlacaFromAtributos(item)
                      const titulo = getVehiculoTituloDinamico(item)
                      return [placa, titulo].filter(Boolean).join(" ")
                    }}
                    itemToStringValue={(item: VehiculoCatalogo) => item?.id ?? ""}
                    value={null}
                    onValueChange={(item: VehiculoCatalogo | null) => {
                      field.handleChange(item?.id ?? "")
                      setSelectedVehiculo(item ?? null)
                      setVehiculoSearch("")
                    }}
                    disabled={vehiculosQuery.isLoading}
                  >
                    <div className="relative w-full">
                      <ComboboxInput
                        id="vehiculo"
                        name={field.name}
                        value={vehiculoSearch}
                        onChange={(e) => setVehiculoSearch(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={
                          vehiculosQuery.isLoading && !vehiculosQuery.data
                            ? "Cargando vehículos..."
                            : "Buscar vehículo por placa, marca o modelo..."
                        }
                        className="w-full shadow-2xs"
                        aria-invalid={isInvalid}
                      />
                      {vehiculosQuery.isFetching && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
                        <span className="font-medium truncate">
                          {vehiculosQuery.isFetching
                            ? "Buscando en servidor..."
                            : debouncedVehiculoSearch.trim()
                              ? `Resultados (${totalElements} encontrados)`
                              : `Vehículos (${totalElements} registros)`}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={handleVehiculoRefresh}
                          disabled={vehiculosQuery.isFetching}
                          title="Recargar lista de vehículos"
                          className="size-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
                        >
                          <RefreshCw
                            className={cn(
                              "size-3",
                              vehiculosQuery.isFetching && "animate-spin"
                            )}
                          />
                        </Button>
                      </div>

                      <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
                        {vehiculosQuery.isLoading
                          ? "Buscando vehículos..."
                          : "No se encontraron vehículos coincidentes."}
                      </ComboboxEmpty>

                      <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain pr-1 py-1">
                        {(item: VehiculoCatalogo) => {
                          const { valor: placa } = getPlacaFromAtributos(item)
                          const titulo = getVehiculoTituloDinamico(item)
                          return (
                            <ComboboxItem
                              key={item.id}
                              value={item}
                              className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="relative size-8 rounded-lg border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                                  {item.urlImagen ? (
                                    <AuthenticatedImage
                                      src={item.urlImagen}
                                      alt={titulo}
                                      className="size-full object-cover"
                                      fallback={
                                        <Car className="size-4 text-muted-foreground" />
                                      }
                                    />
                                  ) : (
                                    <Car className="size-4 text-primary" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {placa ? (
                                      <span className="font-mono text-[11px] font-black tracking-wider border-2 border-cyan-600/45 dark:border-cyan-400/45 bg-cyan-500/12 text-foreground px-1.5 py-0.2 rounded shrink-0 uppercase">
                                        {placa}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] italic text-muted-foreground shrink-0">
                                        Sin placa
                                      </span>
                                    )}
                                    {titulo !== placa ? (
                                      <span className="truncate text-xs font-semibold text-foreground">
                                        {titulo}
                                      </span>
                                    ) : null}
                                    {item.estadoOperativo?.nombre ? (
                                      <span
                                        className="text-[9.5px] font-medium px-1.5 py-0.2 rounded border inline-flex items-center gap-1 shrink-0"
                                        style={{
                                          backgroundColor: `${item.estadoOperativo.color || "#10b981"}18`,
                                          color: item.estadoOperativo.color || "#10b981",
                                          borderColor: `${item.estadoOperativo.color || "#10b981"}40`,
                                        }}
                                      >
                                        <span
                                          className="size-1.5 rounded-full"
                                          style={{
                                            backgroundColor:
                                              item.estadoOperativo.color || "#10b981",
                                          }}
                                        />
                                        {item.estadoOperativo.nombre}
                                      </span>
                                    ) : null}
                                  </div>
                                  {item.ubicacion?.nombre ? (
                                    <p className="text-[10.5px] text-muted-foreground truncate mt-0.5 leading-snug">
                                      {item.ubicacion.nombre}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </ComboboxItem>
                          )
                        }}
                      </ComboboxList>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-2 py-1.5 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground select-none">
                          <span className="font-medium tabular-nums">
                            Página {vehiculoPage + 1} de {totalPages}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setVehiculoPage((p) => Math.max(0, p - 1))
                              }}
                              disabled={vehiculoPage === 0 || vehiculosQuery.isFetching}
                              className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Página anterior"
                            >
                              <ChevronLeft className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setVehiculoPage((p) => Math.min(totalPages - 1, p + 1))
                              }}
                              disabled={
                                vehiculoPage >= totalPages - 1 ||
                                vehiculosQuery.isFetching
                              }
                              className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Página siguiente"
                            >
                              <ChevronRight className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </ComboboxContent>
                  </Combobox>
                )}

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 2. Conductor / Empleado */}
        <form.Field name="empleadoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Conductor / Empleado Asignado
                </RequiredFieldLabel>
                <EmpleadoCombobox
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(val) => field.handleChange(val ?? "")}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Buscar y seleccionar conductor o empleado..."
                  className="w-full"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 3. Fecha y Hora de Salida */}
        <form.Field name="fecha">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Fecha y Hora de Salida
                </RequiredFieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="h-9 text-xs shadow-2xs"
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 4. Descripción de la Actividad */}
        <form.Field name="descripcionActividad">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Descripción de la Actividad
                </RequiredFieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Describa la actividad a realizar en la salida vehicular..."
                  rows={3}
                  className="resize-none"
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* 4. Observaciones */}
        <form.Field name="observaciones">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  Observaciones (Opcional)
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Ingrese observaciones adicionales si corresponde..."
                  rows={2}
                  className="resize-none"
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
