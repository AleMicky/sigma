import { useId, useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  Car,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Search,
  UserCheck,
  UserRound,
  X,
} from "lucide-react"

import { vehiculoQueries } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.queries"
import type { VehiculoCatalogo } from "@/modules/gestionvehicular/vehiculo/api/vehiculo.types"
import {
  getPlacaFromAtributos,
  getVehiculoTituloDinamico,
} from "@/modules/gestionvehicular/vehiculo/lib/vehiculo-atributos.utils"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { SegmentedRadioGroup } from "@/shared/components/segmented-radio-group"
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

import { useRegistrarSalidaPorteriaMutation } from "../api/porteria.mutations"
import type { TipoMovimientoPorteria } from "../api/porteria.types"

type TipoRegistro = "interno" | "externo"

type FieldErrors = {
  conductor?: string
  vehiculo?: string
  personaExterna?: string
  placaExterna?: string
  fechaHora?: string
}

function getLocalDateTimeInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function SectionTitle({
  step,
  title,
  description,
  action,
}: {
  step: number
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

function VehiculoSelector({
  value,
  onChange,
  id,
  invalid = false,
  describedBy,
}: {
  value: VehiculoCatalogo | null
  onChange: (vehiculo: VehiculoCatalogo | null) => void
  id?: string
  invalid?: boolean
  describedBy?: string
}) {
  const [search, setSearch] = useState("")
  const [fotoAmpliada, setFotoAmpliada] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)

  const vehiculosQuery = useQuery(
    vehiculoQueries.list({
      page: 0,
      size: 20,
      q: debouncedSearch.trim() || undefined,
      activo: true,
      sortBy: "nombre",
      direction: "ASC",
    })
  )

  const vehiculos = vehiculosQuery.data?.content ?? []

  if (value) {
    const { valor: placa } = getPlacaFromAtributos(value)
    const titulo = getVehiculoTituloDinamico(value)

    return (
      <div
        id={id}
        tabIndex={-1}
        className={cn(
          "space-y-2.5 rounded-xl border bg-background/95 p-2.5 shadow-2xs transition-all hover:border-primary/40",
          invalid ? "border-destructive" : "border-border/80",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {value.urlImagen ? (
              <button
                type="button"
                onClick={() => setFotoAmpliada((prev) => !prev)}
                className="group relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40 transition-all hover:ring-2 hover:ring-primary/40"
                title={fotoAmpliada ? "Reducir foto" : "Ver foto ampliada"}
              >
                <AuthenticatedImage
                  src={value.urlImagen}
                  alt={titulo}
                  className="size-full object-cover"
                  fallback={<Car className="size-6 text-primary/70" />}
                />
                <span className="absolute right-1 bottom-1 flex size-5 items-center justify-center rounded bg-background/85 text-foreground opacity-85 shadow-xs transition-opacity group-hover:opacity-100">
                  {fotoAmpliada ? (
                    <Minimize2 className="size-3" />
                  ) : (
                    <Maximize2 className="size-3" />
                  )}
                </span>
              </button>
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                <Car className="size-6 text-primary/70" />
              </div>
            )}

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {placa ? (
                  <span className="inline-flex items-center rounded border-2 border-cyan-600/45 bg-cyan-500/12 px-1.5 py-0.5 font-mono text-xs font-black tracking-wider text-foreground uppercase dark:border-cyan-400/45">
                    {placa}
                  </span>
                ) : (
                  <span className="text-[11px] italic text-muted-foreground">
                    Sin placa
                  </span>
                )}
                {titulo !== placa ? (
                  <span className="truncate text-sm font-semibold text-foreground">
                    {titulo}
                  </span>
                ) : null}
              </div>
              {value.ubicacion?.nombre ? (
                <p className="truncate text-xs text-muted-foreground">
                  {value.ubicacion.nombre}
                </p>
              ) : null}
              {value.urlImagen ? (
                <button
                  type="button"
                  onClick={() => setFotoAmpliada((prev) => !prev)}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  {fotoAmpliada ? "Ocultar foto ampliada" : "Ver foto ampliada"}
                </button>
              ) : null}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setFotoAmpliada(false)
              onChange(null)
              setSearch("")
            }}
            className="size-7 shrink-0 cursor-pointer rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Cambiar vehículo seleccionado"
          >
            <X className="size-3.5" />
            <span className="sr-only">Remover selección</span>
          </Button>
        </div>

        {fotoAmpliada && value.urlImagen ? (
          <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
            <AuthenticatedImage
              src={value.urlImagen}
              alt={titulo}
              className="max-h-60 w-full object-contain"
              fallback={
                <div className="flex h-36 items-center justify-center">
                  <Car className="size-8 text-muted-foreground/60" />
                </div>
              }
            />
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <Combobox
      items={vehiculos}
      filter={() => true}
      value={null}
      onValueChange={(item: VehiculoCatalogo | null) => {
        setFotoAmpliada(false)
        onChange(item ?? null)
        setSearch("")
      }}
      itemToStringLabel={(item: VehiculoCatalogo) => {
        if (!item) return ""
        const { valor: placa } = getPlacaFromAtributos(item)
        const titulo = getVehiculoTituloDinamico(item)
        return [placa, titulo !== placa ? titulo : null].filter(Boolean).join(" - ")
      }}
      itemToStringValue={(item: VehiculoCatalogo) => item?.id ?? ""}
      isItemEqualToValue={(a: VehiculoCatalogo, b: VehiculoCatalogo) =>
        a?.id === b?.id
      }
    >
      <div className="relative w-full">
        <ComboboxInput
          placeholder={
            vehiculosQuery.isLoading && !vehiculosQuery.data
              ? "Cargando vehículos..."
              : "Buscar vehículo por placa, marca o modelo..."
          }
          onChange={(e) => setSearch(e.target.value)}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="w-full"
        />
        {vehiculosQuery.isFetching && (
          <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <ComboboxContent>
        <ComboboxEmpty>
          <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
            {vehiculosQuery.isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Buscando vehículos...
              </>
            ) : (
              <>
                <Search className="size-3.5" />
                Sin resultados
              </>
            )}
          </div>
        </ComboboxEmpty>
        <ComboboxList>
          {(vehiculo: VehiculoCatalogo) => {
            const { valor: placa } = getPlacaFromAtributos(vehiculo)
            const titulo = getVehiculoTituloDinamico(vehiculo)
            return (
              <ComboboxItem
                key={vehiculo.id}
                value={vehiculo}
                className="cursor-pointer py-2 px-2.5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                    {vehiculo.urlImagen ? (
                      <AuthenticatedImage
                        src={vehiculo.urlImagen}
                        alt={titulo}
                        className="size-full object-cover"
                        fallback={<Car className="size-4 text-muted-foreground/60" />}
                      />
                    ) : (
                      <Car className="size-4 text-muted-foreground/60" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {placa ? (
                        <span className="inline-flex items-center rounded border-2 border-cyan-600/45 bg-cyan-500/12 px-1.5 py-0.2 font-mono text-[11px] font-black tracking-wider text-foreground uppercase dark:border-cyan-400/45">
                          {placa}
                        </span>
                      ) : (
                        <span className="text-[10px] italic text-muted-foreground">
                          Sin placa
                        </span>
                      )}
                      {titulo !== placa ? (
                        <span className="truncate text-xs font-semibold text-foreground">
                          {titulo}
                        </span>
                      ) : null}
                    </div>
                    {vehiculo.ubicacion?.nombre ? (
                      <span className="line-clamp-1 text-[11px] text-muted-foreground">
                        {vehiculo.ubicacion.nombre}
                      </span>
                    ) : null}
                  </div>
                </div>
              </ComboboxItem>
            )
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function UbicacionSelector({
  value,
  onChange,
  placeholder = "Buscar ubicación...",
  id,
}: {
  value: Ubicacion | null
  onChange: (ubicacion: Ubicacion | null) => void
  placeholder?: string
  id?: string
}) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
      page: 0,
      size: 30,
      q: debouncedSearch.trim() || undefined,
    })
  )

  const ubicaciones = ubicacionesQuery.data?.content ?? []

  if (value) {
    return (
      <div
        id={id}
        tabIndex={-1}
        className="flex min-h-9 items-center justify-between gap-2 rounded-xl border border-border/80 bg-background/95 px-2.5 py-1.5 shadow-2xs transition-all hover:border-primary/40"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
            <MapPin className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-foreground">
              {value.nombre}
            </div>
            {value.codigo ? (
              <div className="truncate font-mono text-[10px] text-muted-foreground">
                {value.codigo}
              </div>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            onChange(null)
            setSearch("")
          }}
          className="size-6 shrink-0 cursor-pointer rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Cambiar ubicación"
        >
          <X className="size-3.5" />
          <span className="sr-only">Remover selección</span>
        </Button>
      </div>
    )
  }

  return (
    <Combobox
      items={ubicaciones}
      filter={() => true}
      value={null}
      onValueChange={(item: Ubicacion | null) => {
        onChange(item ?? null)
        setSearch("")
      }}
      itemToStringLabel={(item: Ubicacion) =>
        item ? `${item.codigo} - ${item.nombre}` : ""
      }
      itemToStringValue={(item: Ubicacion) => item?.id ?? ""}
      isItemEqualToValue={(a: Ubicacion, b: Ubicacion) => a?.id === b?.id}
    >
      <div className="relative w-full">
        <ComboboxInput
          placeholder={
            ubicacionesQuery.isLoading && !ubicacionesQuery.data
              ? "Cargando ubicaciones..."
              : placeholder
          }
          onChange={(e) => setSearch(e.target.value)}
          id={id}
          className="w-full"
        />
        {ubicacionesQuery.isFetching && (
          <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <ComboboxContent>
        <ComboboxEmpty>
          <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
            {ubicacionesQuery.isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Buscando ubicaciones...
              </>
            ) : (
              <>
                <Search className="size-3.5" />
                Sin resultados
              </>
            )}
          </div>
        </ComboboxEmpty>
        <ComboboxList>
          {(ubi: Ubicacion) => (
            <ComboboxItem
              key={ubi.id}
              value={ubi}
              className="cursor-pointer py-1.5 px-2.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  <span className="font-mono text-xs text-muted-foreground">
                    {ubi.codigo}
                  </span>{" "}
                  {ubi.nombre}
                </span>
                {ubi.tipo && (
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {ubi.tipo.toLowerCase()}
                  </span>
                )}
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

interface RegistrarSalidaPorteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTipoMovimiento?: TipoMovimientoPorteria
}

export function RegistrarSalidaPorteriaDialog({
  open,
  onOpenChange,
  initialTipoMovimiento = "SALIDA",
}: RegistrarSalidaPorteriaDialogProps) {
  const mutation = useRegistrarSalidaPorteriaMutation()
  const fieldId = useId()

  const conductorIdField = `${fieldId}-conductor`
  const vehiculoField = `${fieldId}-vehiculo`
  const personaExternaField = `${fieldId}-persona-externa`
  const placaExternaField = `${fieldId}-placa-externa`
  const fechaHoraField = `${fieldId}-fecha-hora`
  const origenField = `${fieldId}-origen`
  const destinoField = `${fieldId}-destino`
  const observacionField = `${fieldId}-observacion`

  const [tipoMovimiento, setTipoMovimiento] =
    useState<TipoMovimientoPorteria>(initialTipoMovimiento)
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>("interno")

  // Interno
  const [conductorId, setConductorId] = useState("")
  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState<VehiculoCatalogo | null>(null)

  // Externo
  const [personaExterna, setPersonaExterna] = useState("")
  const [placaExterna, setPlacaExterna] = useState("")

  // Ruta (Origen y Destino)
  const [origenUbicacion, setOrigenUbicacion] = useState<Ubicacion | null>(null)
  const [destinoUbicacion, setDestinoUbicacion] = useState<Ubicacion | null>(null)
  const [usarDestinoOtro, setUsarDestinoOtro] = useState(false)
  const [destinoOtro, setDestinoOtro] = useState("")

  // General
  const [fechaHoraSalida, setFechaHoraSalida] = useState(() =>
    getLocalDateTimeInputValue()
  )
  const [observacionSalida, setObservacionSalida] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setTipoMovimiento(initialTipoMovimiento)
      setTipoRegistro("interno")
      setConductorId("")
      setVehiculoSeleccionado(null)
      setPersonaExterna("")
      setPlacaExterna("")
      setOrigenUbicacion(null)
      setDestinoUbicacion(null)
      setUsarDestinoOtro(false)
      setDestinoOtro("")
      setFechaHoraSalida(getLocalDateTimeInputValue())
      setObservacionSalida("")
      setFormError(null)
      setFieldErrors({})
    }
  }

  const esEntrada = tipoMovimiento === "ENTRADA"
  const personaFieldId =
    tipoRegistro === "interno" ? conductorIdField : personaExternaField

  const esInternoValido = Boolean(conductorId) && Boolean(vehiculoSeleccionado)

  const esExternoValido =
    personaExterna.trim().length > 0 && placaExterna.trim().length > 0

  const canSubmit = tipoRegistro === "interno" ? esInternoValido : esExternoValido

  const handleSubmit = async () => {
    setFormError(null)

    const nextErrors: FieldErrors = {}
    if (tipoRegistro === "interno") {
      if (!conductorId) {
        nextErrors.conductor = esEntrada
          ? "Seleccione el conductor que ingresa."
          : "Seleccione el conductor que sale."
      }
      if (!vehiculoSeleccionado) {
        nextErrors.vehiculo = "Seleccione el vehículo."
      }
    } else {
      if (!personaExterna.trim()) {
        nextErrors.personaExterna = "Ingrese el nombre de la persona externa."
      }
      if (!placaExterna.trim()) {
        nextErrors.placaExterna = "Ingrese la placa del vehículo externo."
      }
    }
    if (!fechaHoraSalida) {
      nextErrors.fechaHora = "Seleccione la fecha y hora."
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (tipoRegistro === "interno") {
      // El bloque de validación anterior garantiza que no sea null.
      if (!vehiculoSeleccionado) return

      await mutation.mutateAsync({
        tipoMovimiento,
        esExterno: false,
        empleadoId: conductorId,
        origenUbicacionId: origenUbicacion?.id,
        destinoUbicacionId: usarDestinoOtro ? undefined : destinoUbicacion?.id,
        destinoOtro: usarDestinoOtro ? (destinoOtro.trim() || undefined) : undefined,
        fechaHoraSalida: fechaHoraSalida
          ? new Date(fechaHoraSalida).toISOString()
          : undefined,
        observacionSalida: observacionSalida.trim() || undefined,
        activos: [
          {
            activoId: vehiculoSeleccionado.id,
            cantidad: 1,
          },
        ],
      })
    } else {
      await mutation.mutateAsync({
        tipoMovimiento,
        esExterno: true,
        personaExterna: personaExterna.trim(),
        placaExterna: placaExterna.trim().toUpperCase(),
        origenUbicacionId: origenUbicacion?.id,
        destinoUbicacionId: usarDestinoOtro ? undefined : destinoUbicacion?.id,
        destinoOtro: usarDestinoOtro ? (destinoOtro.trim() || undefined) : undefined,
        fechaHoraSalida: fechaHoraSalida
          ? new Date(fechaHoraSalida).toISOString()
          : undefined,
        observacionSalida: observacionSalida.trim() || undefined,
        activos: [
          {
            descripcionItem: `Vehículo - Placa: ${placaExterna.trim().toUpperCase()}`,
            cantidad: 1,
          },
        ],
      })
    }

    onOpenChange(false)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        esEntrada
          ? "Registrar entrada en portería"
          : "Registrar salida en portería"
      }
      description={
        esEntrada
          ? "Registra el ingreso; luego deberá completarse con su salida."
          : "Registra la salida; luego deberá completarse con su entrada."
      }
      formError={formError}
      onSubmit={handleSubmit}
      size="lg"
      footer={
        <FormDialogSubmit
          canSubmit={canSubmit}
          isSubmitting={mutation.isPending}
          allowInvalidSubmit
          label={
            esEntrada
              ? tipoRegistro === "interno"
                ? "Registrar entrada (Interno)"
                : "Registrar entrada (Externo)"
              : tipoRegistro === "interno"
                ? "Registrar salida (Interno)"
                : "Registrar salida (Externo)"
          }
          submittingLabel="Registrando…"
        />
      }
    >
      <div className="space-y-6">
        {/* Selectores de Tipo de Movimiento (Salida / Entrada) y Tipo de Pase (Interno / Externo) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col justify-between gap-2 rounded-xl border bg-muted/30 p-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo de movimiento
              </p>
              <p className="text-xs text-muted-foreground">
                {esEntrada
                  ? "Ingresa ahora (pendiente de salida)"
                  : "Sale ahora (pendiente de entrada)"}
              </p>
            </div>
            <SegmentedRadioGroup
              name={`${fieldId}-tipo-movimiento`}
              ariaLabel="Tipo de movimiento"
              value={tipoMovimiento}
              onValueChange={setTipoMovimiento}
              options={[
                {
                  value: "SALIDA",
                  label: "Salida",
                  icon: <LogOut className="size-3.5" />,
                  activeClassName: "bg-amber-600 text-white shadow-sm",
                },
                {
                  value: "ENTRADA",
                  label: "Entrada",
                  icon: <LogIn className="size-3.5" />,
                  activeClassName: "bg-emerald-600 text-white shadow-sm",
                },
              ]}
            />
          </div>

          <div className="flex flex-col justify-between gap-2 rounded-xl border bg-muted/30 p-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo de pase
              </p>
              <p className="text-xs text-muted-foreground">
                {tipoRegistro === "interno"
                  ? "Conductor interno"
                  : "Persona o visita externa"}
              </p>
            </div>
            <SegmentedRadioGroup<TipoRegistro>
              name={`${fieldId}-tipo-pase`}
              ariaLabel="Tipo de pase"
              value={tipoRegistro}
              onValueChange={(next) => {
                setTipoRegistro(next)
                setFieldErrors({})
              }}
              options={[
                {
                  value: "interno",
                  label: "Interno",
                  icon: <UserRound className="size-3.5" />,
                  activeClassName: "bg-primary text-primary-foreground shadow-sm",
                },
                {
                  value: "externo",
                  label: "Externo",
                  icon: <Building2 className="size-3.5" />,
                  activeClassName: "bg-purple-600 text-white shadow-sm",
                },
              ]}
            />
          </div>
        </div>

        {/* Paso 1: ¿Quién sale / ingresa? */}
        <section className="space-y-3">
          <SectionTitle
            step={1}
            title={
              tipoRegistro === "interno"
                ? esEntrada
                  ? "¿Quién ingresa? (Conductor)"
                  : "¿Quién sale? (Conductor)"
                : esEntrada
                  ? "¿Quién ingresa? (Persona externa)"
                  : "¿Quién sale? (Persona externa)"
            }
            description={
              tipoRegistro === "interno"
                ? "Seleccione el conductor registrado de la empresa."
                : "Indique el nombre completo de la persona externa o conductor."
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <Field className="sm:col-span-3">
              <RequiredFieldLabel htmlFor={personaFieldId}>
                {tipoRegistro === "interno" ? (
                  <>
                    <UserRound className="size-3.5" />
                    Conductor
                  </>
                ) : (
                  <>
                    <UserCheck className="size-3.5" />
                    Nombre de la persona
                  </>
                )}
              </RequiredFieldLabel>
              {tipoRegistro === "interno" ? (
                <EmpleadoCombobox
                  id={conductorIdField}
                  value={conductorId}
                  onValueChange={(val) => {
                    setConductorId(val)
                    setFieldErrors((prev) => ({ ...prev, conductor: undefined }))
                  }}
                  placeholder="Buscar conductor..."
                  aria-invalid={Boolean(fieldErrors.conductor)}
                  aria-describedby={
                    fieldErrors.conductor ? `${conductorIdField}-error` : undefined
                  }
                />
              ) : (
                <Input
                  id={personaExternaField}
                  placeholder="Ej. Juan Carlos Pérez - Proveedor XYZ"
                  value={personaExterna}
                  onChange={(e) => {
                    setPersonaExterna(e.target.value)
                    setFieldErrors((prev) => ({
                      ...prev,
                      personaExterna: undefined,
                    }))
                  }}
                  aria-invalid={Boolean(fieldErrors.personaExterna)}
                  aria-describedby={
                    fieldErrors.personaExterna
                      ? `${personaFieldId}-error`
                      : undefined
                  }
                  autoFocus
                />
              )}
              <FieldError id={`${personaFieldId}-error`}>
                {tipoRegistro === "interno"
                  ? fieldErrors.conductor
                  : fieldErrors.personaExterna}
              </FieldError>
            </Field>

            <Field className="sm:col-span-2">
              <RequiredFieldLabel htmlFor={fechaHoraField}>
                <Clock className="size-3.5" />
                {esEntrada ? "Hora de entrada" : "Hora de salida"}
              </RequiredFieldLabel>
              <div className="flex gap-2">
                <Input
                  id={fechaHoraField}
                  type="datetime-local"
                  value={fechaHoraSalida}
                  onChange={(e) => {
                    setFechaHoraSalida(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, fechaHora: undefined }))
                  }}
                  aria-invalid={Boolean(fieldErrors.fechaHora)}
                  aria-describedby={
                    fieldErrors.fechaHora ? `${fechaHoraField}-error` : undefined
                  }
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={() => {
                    setFechaHoraSalida(getLocalDateTimeInputValue())
                    setFieldErrors((prev) => ({ ...prev, fechaHora: undefined }))
                  }}
                >
                  Ahora
                </Button>
              </div>
              <FieldError id={`${fechaHoraField}-error`}>
                {fieldErrors.fechaHora}
              </FieldError>
            </Field>
          </div>
        </section>

        {/* Paso 2: Vehículo */}
        <section className="space-y-3">
          <SectionTitle
            step={2}
            title={tipoRegistro === "interno" ? "Vehículo" : "Vehículo externo"}
            description={
              tipoRegistro === "interno"
                ? esEntrada
                  ? "Seleccione el vehículo que ingresa."
                  : "Seleccione el vehículo que sale."
                : "Ingrese la placa del vehículo externo."
            }
          />

          {tipoRegistro === "interno" ? (
            <div className="rounded-xl border bg-muted/20 p-3">
              <Field>
                <RequiredFieldLabel htmlFor={vehiculoField}>
                  <Car className="size-3.5" />
                  Vehículo
                </RequiredFieldLabel>
                <VehiculoSelector
                  id={vehiculoField}
                  value={vehiculoSeleccionado}
                  onChange={(vehiculo) => {
                    setVehiculoSeleccionado(vehiculo)
                    setFieldErrors((prev) => ({ ...prev, vehiculo: undefined }))
                  }}
                  invalid={Boolean(fieldErrors.vehiculo)}
                  describedBy={
                    fieldErrors.vehiculo ? `${vehiculoField}-error` : undefined
                  }
                />
                <FieldError id={`${vehiculoField}-error`}>
                  {fieldErrors.vehiculo}
                </FieldError>
              </Field>
            </div>
          ) : (
            <div className="rounded-xl border bg-purple-500/[0.03] border-purple-500/20 p-3">
              <Field>
                <RequiredFieldLabel htmlFor={placaExternaField}>
                  <Car className="size-3.5 text-purple-600 dark:text-purple-400" />
                  Placa del vehículo externo
                </RequiredFieldLabel>
                <Input
                  id={placaExternaField}
                  placeholder="Ej. 4521-KLP"
                  value={placaExterna}
                  onChange={(e) => {
                    setPlacaExterna(e.target.value.toUpperCase())
                    setFieldErrors((prev) => ({
                      ...prev,
                      placaExterna: undefined,
                    }))
                  }}
                  aria-invalid={Boolean(fieldErrors.placaExterna)}
                  aria-describedby={
                    fieldErrors.placaExterna
                      ? `${placaExternaField}-error`
                      : undefined
                  }
                  className="font-mono uppercase tracking-wider text-sm font-semibold"
                />
                <FieldError id={`${placaExternaField}-error`}>
                  {fieldErrors.placaExterna}
                </FieldError>
              </Field>
            </div>
          )}
        </section>

        {/* Paso 3: Ruta (Origen y Destino) */}
        <section className="space-y-3">
          <SectionTitle
            step={3}
            title="Ruta (Origen y Destino)"
            description="Opcional. Punto de partida y destino del vehículo o persona."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={origenField}>
                <MapPin className="size-3.5 text-muted-foreground" />
                Origen
              </FieldLabel>
              <UbicacionSelector
                id={origenField}
                value={origenUbicacion}
                onChange={setOrigenUbicacion}
                placeholder="Seleccionar origen..."
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={destinoField}>
                  <Navigation className="size-3.5 text-muted-foreground" />
                  Destino
                </FieldLabel>
                <button
                  type="button"
                  onClick={() => {
                    const next = !usarDestinoOtro
                    setUsarDestinoOtro(next)
                    if (next) {
                      setDestinoUbicacion(null)
                    } else {
                      setDestinoOtro("")
                    }
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {usarDestinoOtro ? "Elegir del catálogo" : "Otro destino..."}
                </button>
              </div>
              {usarDestinoOtro ? (
                <Input
                  id={destinoField}
                  placeholder="Ej. Cochabamba / Taller externo..."
                  value={destinoOtro}
                  onChange={(e) => setDestinoOtro(e.target.value)}
                />
              ) : (
                <UbicacionSelector
                  id={destinoField}
                  value={destinoUbicacion}
                  onChange={setDestinoUbicacion}
                  placeholder="Seleccionar destino..."
                />
              )}
            </Field>
          </div>
        </section>

        {/* Paso 4: Observaciones */}
        <section className="space-y-3">
          <SectionTitle
            step={4}
            title="Observaciones"
            description="Opcional. Motivo de la salida o detalle adicional."
          />
          <Field>
            <FieldLabel htmlFor={observacionField} className="sr-only">
              Observación general de salida
            </FieldLabel>
            <Textarea
              id={observacionField}
              rows={2}
              placeholder="Ej. Salida autorizada para supervisión, entrega de suministros..."
              value={observacionSalida}
              onChange={(e) => setObservacionSalida(e.target.value)}
            />
          </Field>
        </section>
      </div>
    </FormDialog>
  )
}
