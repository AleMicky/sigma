import { useEffect, useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Barcode,
  Building2,
  Car,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  PenLine,
  Search,
  UserCheck,
  UserRound,
} from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
import type { Activo } from "@/modules/activos/activo/api/activo.service"
import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import {
  FormDialog,
  FormDialogSubmit,
  RequiredFieldLabel,
} from "@/shared/components/form-dialog"
import { Button } from "@/shared/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { cn } from "@/shared/lib/utils"

import { useRegistrarSalidaPorteriaMutation } from "../api/porteria.mutations"

type TipoRegistro = "interno" | "externo"
type ItemModo = "activo" | "libre"

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

function ActivoSelector({
  value,
  onChange,
}: {
  value: Activo | null
  onChange: (activo: Activo | null) => void
}) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const activosQuery = useQuery(
    activoQueries.list({
      page: 0,
      size: 20,
      q: debouncedSearch || undefined,
    })
  )

  const activos = activosQuery.data?.content ?? []

  return (
    <Combobox
      items={activos}
      value={value}
      onValueChange={(item: Activo | null) => onChange(item ?? null)}
      itemToStringLabel={(item: Activo) =>
        item ? `${item.codigo} - ${item.nombre}` : ""
      }
      isItemEqualToValue={(a: Activo, b: Activo) => a.id === b.id}
    >
      <ComboboxInput
        placeholder="Buscar vehículo/activo por código o nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        showClear={Boolean(value)}
      />
      <ComboboxContent>
        <ComboboxList>
          {activosQuery.isLoading ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              <Loader2 className="mr-2 size-3.5 animate-spin" />
              Buscando activos...
            </div>
          ) : (
            <>
              <ComboboxEmpty>
                <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
                  <Search className="size-3.5" />
                  Sin resultados
                </div>
              </ComboboxEmpty>
              {activos.map((activo) => (
                <ComboboxItem key={activo.id} value={activo}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      <span className="font-mono text-xs text-muted-foreground">
                        {activo.codigo}
                      </span>{" "}
                      {activo.nombre}
                    </span>
                    {activo.descripcion && (
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {activo.descripcion}
                      </span>
                    )}
                  </div>
                </ComboboxItem>
              ))}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function UbicacionSelector({
  value,
  onChange,
  placeholder = "Buscar ubicación...",
}: {
  value: Ubicacion | null
  onChange: (ubicacion: Ubicacion | null) => void
  placeholder?: string
}) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const ubicacionesQuery = useQuery(
    ubicacionQueries.list({
      page: 0,
      size: 30,
      q: debouncedSearch || undefined,
    })
  )

  const ubicaciones = ubicacionesQuery.data?.content ?? []

  return (
    <Combobox
      items={ubicaciones}
      value={value}
      onValueChange={(item: Ubicacion | null) => onChange(item ?? null)}
      itemToStringLabel={(item: Ubicacion) =>
        item ? `${item.codigo} - ${item.nombre}` : ""
      }
      isItemEqualToValue={(a: Ubicacion, b: Ubicacion) => a.id === b.id}
    >
      <ComboboxInput
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        showClear={Boolean(value)}
      />
      <ComboboxContent>
        <ComboboxList>
          {ubicacionesQuery.isLoading ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              <Loader2 className="mr-2 size-3.5 animate-spin" />
              Buscando ubicaciones...
            </div>
          ) : (
            <>
              <ComboboxEmpty>
                <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
                  <Search className="size-3.5" />
                  Sin resultados
                </div>
              </ComboboxEmpty>
              {ubicaciones.map((ubi) => (
                <ComboboxItem key={ubi.id} value={ubi}>
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
              ))}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function ModoToggle({
  value,
  onChange,
}: {
  value: ItemModo
  onChange: (modo: ItemModo) => void
}) {
  const opciones: { value: ItemModo; label: string; icon: typeof Barcode }[] = [
    { value: "activo", label: "Vehículo / Activo catálogo", icon: Barcode },
    { value: "libre", label: "Descripción libre / Placa", icon: PenLine },
  ]
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-lg border bg-muted/40 p-0.5"
    >
      {opciones.map((op) => {
        const Icon = op.icon
        const active = value === op.value
        return (
          <button
            key={op.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(op.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {op.label}
          </button>
        )
      })}
    </div>
  )
}

interface RegistrarSalidaPorteriaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrarSalidaPorteriaDialog({
  open,
  onOpenChange,
}: RegistrarSalidaPorteriaDialogProps) {
  const mutation = useRegistrarSalidaPorteriaMutation()

  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>("interno")

  // Interno
  const [funcionarioId, setFuncionarioId] = useState("")
  const [itemModo, setItemModo] = useState<ItemModo>("activo")
  const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null)
  const [itemDescripcion, setItemDescripcion] = useState("")

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

  useEffect(() => {
    if (open) {
      setTipoRegistro("interno")
      setFuncionarioId("")
      setItemModo("activo")
      setActivoSeleccionado(null)
      setItemDescripcion("")
      setPersonaExterna("")
      setPlacaExterna("")
      setOrigenUbicacion(null)
      setDestinoUbicacion(null)
      setUsarDestinoOtro(false)
      setDestinoOtro("")
      setFechaHoraSalida(getLocalDateTimeInputValue())
      setObservacionSalida("")
      setFormError(null)
    }
  }, [open])

  const esInternoValido =
    Boolean(funcionarioId) &&
    (itemModo === "activo"
      ? Boolean(activoSeleccionado)
      : itemDescripcion.trim().length > 0)

  const esExternoValido =
    personaExterna.trim().length > 0 && placaExterna.trim().length > 0

  const canSubmit = tipoRegistro === "interno" ? esInternoValido : esExternoValido

  const handleSubmit = async () => {
    setFormError(null)

    if (tipoRegistro === "interno") {
      if (!funcionarioId) {
        setFormError("Debe seleccionar el funcionario que sale.")
        return
      }
      if (itemModo === "activo" && !activoSeleccionado) {
        setFormError("Debe seleccionar el vehículo o activo catalogado.")
        return
      }
      if (itemModo === "libre" && !itemDescripcion.trim()) {
        setFormError("Debe ingresar la descripción o placa del vehículo/ítem.")
        return
      }

      await mutation.mutateAsync({
        esExterno: false,
        empleadoId: funcionarioId,
        origenUbicacionId: origenUbicacion?.id,
        destinoUbicacionId: usarDestinoOtro ? undefined : destinoUbicacion?.id,
        destinoOtro: usarDestinoOtro ? (destinoOtro.trim() || undefined) : undefined,
        fechaHoraSalida: fechaHoraSalida
          ? new Date(fechaHoraSalida).toISOString()
          : undefined,
        observacionSalida: observacionSalida.trim() || undefined,
        activos: [
          {
            activoId: itemModo === "activo" ? activoSeleccionado?.id : undefined,
            descripcionItem:
              itemModo === "libre" ? itemDescripcion.trim() : undefined,
            cantidad: 1,
          },
        ],
      })
    } else {
      if (!personaExterna.trim()) {
        setFormError("Debe ingresar el nombre de la persona externa.")
        return
      }
      if (!placaExterna.trim()) {
        setFormError("Debe ingresar la placa del vehículo externo.")
        return
      }

      await mutation.mutateAsync({
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
      title="Registrar salida en portería"
      description="Control de salida de personal interno y visitas externas."
      formError={formError}
      onSubmit={handleSubmit}
      size="lg"
      footer={
        <FormDialogSubmit
          canSubmit={canSubmit}
          isSubmitting={mutation.isPending}
          label={
            tipoRegistro === "interno"
              ? "Registrar salida (Interno)"
              : "Registrar salida (Externo)"
          }
          submittingLabel="Registrando…"
        />
      }
    >
      <div className="space-y-6">
        {/* Selector de Tipo de Registro: Interno vs Externo */}
        <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tipo de pase / salida
            </p>
            <p className="text-xs text-muted-foreground">
              {tipoRegistro === "interno"
                ? "Personal / funcionario interno"
                : "Persona o visita externa"}
            </p>
          </div>
          <div
            role="radiogroup"
            className="inline-flex rounded-lg border bg-background p-1 shadow-sm"
          >
            <button
              type="button"
              role="radio"
              aria-checked={tipoRegistro === "interno"}
              onClick={() => setTipoRegistro("interno")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                tipoRegistro === "interno"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserRound className="size-3.5" />
              Interno
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={tipoRegistro === "externo"}
              onClick={() => setTipoRegistro("externo")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                tipoRegistro === "externo"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="size-3.5" />
              Externo
            </button>
          </div>
        </div>

        {/* Paso 1: ¿Quién sale? */}
        <section className="space-y-3">
          <SectionTitle
            step={1}
            title={
              tipoRegistro === "interno"
                ? "¿Quién sale? (Funcionario)"
                : "¿Quién sale? (Persona externa)"
            }
            description={
              tipoRegistro === "interno"
                ? "Seleccione el funcionario registrado de la empresa."
                : "Indique el nombre completo de la persona externa o conductor."
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <Field className="sm:col-span-3">
              <RequiredFieldLabel>
                {tipoRegistro === "interno" ? (
                  <>
                    <UserRound className="size-3.5" />
                    Funcionario
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
                  value={funcionarioId}
                  onValueChange={(val) => setFuncionarioId(val)}
                  placeholder="Buscar funcionario..."
                />
              ) : (
                <Input
                  placeholder="Ej. Juan Carlos Pérez - Proveedor XYZ"
                  value={personaExterna}
                  onChange={(e) => setPersonaExterna(e.target.value)}
                  autoFocus
                />
              )}
            </Field>

            <Field className="sm:col-span-2">
              <RequiredFieldLabel>
                <Clock className="size-3.5" />
                Hora de salida
              </RequiredFieldLabel>
              <div className="flex gap-2">
                <Input
                  type="datetime-local"
                  value={fechaHoraSalida}
                  onChange={(e) => setFechaHoraSalida(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={() =>
                    setFechaHoraSalida(getLocalDateTimeInputValue())
                  }
                >
                  Ahora
                </Button>
              </div>
            </Field>
          </div>
        </section>

        {/* Paso 2: Vehículo / Ítem */}
        <section className="space-y-3">
          <SectionTitle
            step={2}
            title={
              tipoRegistro === "interno"
                ? "¿Qué vehículo o activo retira?"
                : "Vehículo externo"
            }
            description={
              tipoRegistro === "interno"
                ? "Seleccione el vehículo institucional del catálogo o ingrese su placa."
                : "Ingrese la placa del vehículo externo."
            }
          />

          {tipoRegistro === "interno" ? (
            <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Modalidad de registro:
                </span>
                <ModoToggle
                  value={itemModo}
                  onChange={(modo) => {
                    setItemModo(modo)
                    setActivoSeleccionado(null)
                    setItemDescripcion("")
                  }}
                />
              </div>

              {itemModo === "activo" ? (
                <Field>
                  <RequiredFieldLabel>
                    <Car className="size-3.5" />
                    Vehículo / Activo
                  </RequiredFieldLabel>
                  <ActivoSelector
                    value={activoSeleccionado}
                    onChange={(activo) => setActivoSeleccionado(activo)}
                  />
                </Field>
              ) : (
                <Field>
                  <RequiredFieldLabel>
                    <PenLine className="size-3.5" />
                    Descripción o placa del vehículo
                  </RequiredFieldLabel>
                  <Input
                    placeholder="Ej. Camioneta Hilux blanca - Placa 3042-YHB"
                    value={itemDescripcion}
                    onChange={(e) => setItemDescripcion(e.target.value)}
                  />
                </Field>
              )}
            </div>
          ) : (
            <div className="rounded-xl border bg-purple-500/[0.03] border-purple-500/20 p-3">
              <Field>
                <RequiredFieldLabel>
                  <Car className="size-3.5 text-purple-600 dark:text-purple-400" />
                  Placa del vehículo externo
                </RequiredFieldLabel>
                <Input
                  placeholder="Ej. 4521-KLP"
                  value={placaExterna}
                  onChange={(e) => setPlacaExterna(e.target.value.toUpperCase())}
                  className="font-mono uppercase tracking-wider text-sm font-semibold"
                />
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
              <FieldLabel>
                <MapPin className="size-3.5 text-muted-foreground" />
                Origen
              </FieldLabel>
              <UbicacionSelector
                value={origenUbicacion}
                onChange={setOrigenUbicacion}
                placeholder="Seleccionar origen..."
              />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>
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
                  placeholder="Ej. Cochabamba / Taller externo..."
                  value={destinoOtro}
                  onChange={(e) => setDestinoOtro(e.target.value)}
                />
              ) : (
                <UbicacionSelector
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
            <FieldLabel className="sr-only">
              Observación general de salida
            </FieldLabel>
            <Textarea
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
