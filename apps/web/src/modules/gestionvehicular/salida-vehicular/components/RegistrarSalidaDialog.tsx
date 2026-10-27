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

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
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
import { Field, FieldError } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { cn } from "@/shared/lib/utils"

import { useRegistrarSalidaMutation } from "../api/salida-vehicular.mutations"
import type { SalidaVehicular } from "../api/salida-vehicular.types"
import {
  defaultRegistrarSalidaValues,
  registrarSalidaSchema,
} from "../schemas/salida-vehicular.schema"

function getCleanPlaca(desc?: string | null): string | null {
  if (!desc) return null
  const match = desc.match(/PLACA[:\s#-]+([A-Z0-9]+)/i)
  return match ? match[1].trim() : null
}

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
  const [selectedActivo, setSelectedActivo] = useState<Activo | null>(null)
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
          origen: value.origen.trim(),
          destino: value.destino.trim(),
          motivo: value.motivo.trim(),
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

  // Fetch paginado de vehículos con búsqueda
  const activosQuery = useQuery(
    activoQueries.list({
      page: vehiculoPage,
      size: 10,
      q: debouncedVehiculoSearch || undefined,
      sortBy: "codigo",
      direction: "ASC",
    })
  )

  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content]
  )
  const totalPages = activosQuery.data?.totalPages ?? 1
  const totalElements = activosQuery.data?.totalElements ?? activos.length

  // Consulta individual si hay un valor seleccionado
  const singleActivoQuery = useQuery({
    ...activoQueries.detail(formActivoId),
    enabled: Boolean(formActivoId && !selectedActivo),
  })

  const currentActivo = selectedActivo ?? singleActivoQuery.data ?? null
  const currentTipo =
    currentActivo?.tipoActivo?.nombre ??
    (currentActivo as { tipoActivoNombre?: string } | null)?.tipoActivoNombre ??
    null

  const handleReset = useCallback(() => {
    setFormError(null)
    setSelectedActivo(null)
    setVehiculoSearch("")
    setVehiculoPage(0)
    form.reset()
  }, [form])

  useEffect(() => {
    if (open) {
      handleReset()
    }
  }, [open, handleReset])

  const handleVehiculoRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    activosQuery.refetch()
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

                {currentActivo ? (
                  <div className="flex items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-background/95 px-3 py-2 min-h-10 shadow-2xs hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative size-8 rounded-lg border border-border/80 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                        {currentActivo.urlImagen ? (
                          <AuthenticatedImage
                            src={currentActivo.urlImagen}
                            alt={currentActivo.nombre}
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
                          {getCleanPlaca(currentActivo.descripcion) && (
                            <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                              {getCleanPlaca(currentActivo.descripcion)}
                            </span>
                          )}
                          <span className="font-semibold text-xs text-foreground truncate leading-snug">
                            {currentActivo.nombre}
                          </span>
                          {currentTipo && (
                            <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.2 rounded bg-muted/60 border border-border/50 shrink-0">
                              {currentTipo}
                            </span>
                          )}
                        </div>
                        {currentActivo.descripcion && (
                          <p
                            className="text-[11px] text-muted-foreground truncate leading-snug"
                            title={currentActivo.descripcion}
                          >
                            {currentActivo.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        field.handleChange("")
                        setSelectedActivo(null)
                      }}
                      className="size-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md shrink-0 cursor-pointer"
                      title="Cambiar vehículo seleccionado"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Combobox
                    items={activos}
                    filter={() => true}
                    itemToStringLabel={(item: Activo) =>
                      item ? `${item.nombre} ${item.descripcion ?? ""}` : ""
                    }
                    itemToStringValue={(item: Activo) => item?.id ?? ""}
                    value={null}
                    onValueChange={(item: Activo | null) => {
                      field.handleChange(item?.id ?? "")
                      setSelectedActivo(item ?? null)
                      setVehiculoSearch("")
                    }}
                    disabled={activosQuery.isLoading}
                  >
                    <div className="relative w-full">
                      <ComboboxInput
                        id="vehiculo"
                        name={field.name}
                        value={vehiculoSearch}
                        onChange={(e) => setVehiculoSearch(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={
                          activosQuery.isLoading && !activosQuery.data
                            ? "Cargando vehículos..."
                            : "Buscar vehículo por nombre o placa..."
                        }
                        className="w-full shadow-2xs"
                        aria-invalid={isInvalid}
                      />
                      {activosQuery.isFetching && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <ComboboxContent className="z-50 w-(--anchor-width) min-w-[min(100vw-2rem,var(--anchor-width))] max-w-[var(--anchor-width)] p-1 rounded-xl shadow-lg border border-border/80 bg-popover overflow-hidden flex flex-col">
                      {/* Header con indicador y botón de recarga */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/50 text-[11px] text-muted-foreground bg-muted/30 select-none">
                        <span className="font-medium truncate">
                          {activosQuery.isFetching
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
                          disabled={activosQuery.isFetching}
                          title="Recargar lista de vehículos"
                          className="size-6 text-muted-foreground hover:text-foreground hover:bg-background/80"
                        >
                          <RefreshCw
                            className={cn(
                              "size-3",
                              activosQuery.isFetching && "animate-spin"
                            )}
                          />
                        </Button>
                      </div>

                      <ComboboxEmpty className="py-5 text-xs text-muted-foreground text-center">
                        {activosQuery.isLoading
                          ? "Buscando vehículos..."
                          : "No se encontraron vehículos coincidentes."}
                      </ComboboxEmpty>

                      <ComboboxList className="max-h-52 overflow-y-auto overscroll-contain pr-1 py-1">
                        {(item: Activo) => {
                          const placa = getCleanPlaca(item.descripcion)
                          const tipo =
                            item.tipoActivo?.nombre ??
                            (item as { tipoActivoNombre?: string }).tipoActivoNombre
                          return (
                            <ComboboxItem
                              key={item.id}
                              value={item}
                              className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-accent/60 transition-colors"
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <div className="relative size-8 rounded-lg border border-border/60 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0 mt-0.5">
                                  {item.urlImagen ? (
                                    <AuthenticatedImage
                                      src={item.urlImagen}
                                      alt={item.nombre}
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
                                    {placa && (
                                      <span className="font-mono text-[10px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1 rounded shrink-0">
                                        {placa}
                                      </span>
                                    )}
                                    <span className="truncate text-xs font-semibold text-foreground">
                                      {item.nombre}
                                    </span>
                                    {tipo && (
                                      <span className="text-[9.5px] text-muted-foreground font-medium px-1 py-0.2 rounded bg-muted/60 border border-border/50 shrink-0">
                                        {tipo}
                                      </span>
                                    )}
                                  </div>
                                  {item.descripcion && (
                                    <p
                                      className="text-[11px] text-muted-foreground truncate mt-0.5 leading-snug"
                                      title={item.descripcion}
                                    >
                                      {item.descripcion}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </ComboboxItem>
                          )
                        }}
                      </ComboboxList>

                      {/* Footer con controles de paginación */}
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
                              disabled={vehiculoPage === 0 || activosQuery.isFetching}
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
                                activosQuery.isFetching
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

        {/* 3. Ruta: Origen y Destino */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field name="origen">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Origen
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Lugar de origen..."
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="destino">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <RequiredFieldLabel htmlFor={field.name}>
                    Destino
                  </RequiredFieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Lugar de destino..."
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>

        {/* 4. Motivo */}
        <form.Field name="motivo">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Motivo / Justificación del Viaje
                </RequiredFieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Describa el objetivo o justificación del viaje..."
                  rows={3}
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
