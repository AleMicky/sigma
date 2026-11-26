import { useMemo, type ComponentType } from "react"
import { Activity, Calendar, FileText, MapPin } from "lucide-react"

import type { EstadoOperativo } from "@/modules/activos/estado-operativo/api/estado-operativo.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "@/modules/parametros/ubicacion/lib/tipo-ubicacion.config"
import { FormSection } from "@/shared/components/form-section"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import {
  OptionsCombobox,
  type OptionsComboboxOption,
} from "@/shared/components/options-combobox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

import type { ActivoFormApi } from "../../lib/activo-form.types"

type ActivoFormMainSectionProps = {
  form: ActivoFormApi
  tipos: TipoActivo[]
  tiposById: Map<string, TipoActivo>
  selectedTipo?: TipoActivo
  selectedColor: string
  SelectedIcon: ComponentType<{ className?: string }>
  tiposQueryLoading: boolean
  ubicaciones?: Ubicacion[]
  ubicacionesById?: Map<string, Ubicacion>
  ubicacionesLoading?: boolean
  estadosOperativos?: EstadoOperativo[]
  estadosLoading?: boolean
  estadosErrorMessage?: string | null
  onEstadoChange?: (estadoOperativoId: string) => void
}

export function ActivoFormMainSection({
  form,
  tipos,
  tiposById,
  selectedTipo,
  selectedColor,
  SelectedIcon,
  tiposQueryLoading,
  ubicaciones = [],
  ubicacionesById = new Map(),
  ubicacionesLoading = false,
  estadosOperativos = [],
  estadosLoading = false,
  estadosErrorMessage = null,
  onEstadoChange,
}: ActivoFormMainSectionProps) {
  const tipoOptions = useMemo<OptionsComboboxOption[]>(
    () => tipos.map((tipo) => ({ value: tipo.id, label: tipo.nombre })),
    [tipos],
  )

  const estadoOptions = useMemo<OptionsComboboxOption[]>(
    () =>
      estadosOperativos.map((estado) => ({
        value: estado.id,
        label: estado.nombre,
        keywords: [estado.codigo],
      })),
    [estadosOperativos],
  )

  const renderTipoOption = (option: OptionsComboboxOption) => {
    const tipo = tiposById.get(option.value)
    if (!tipo) return <span className="truncate">{option.label}</span>
    const Icon = getTipoActivoIcon(tipo.icono)
    return (
      <span className="flex min-w-0 items-center gap-2 truncate">
        <span
          className="flex size-4 shrink-0 items-center justify-center rounded-sm text-white"
          style={{ backgroundColor: tipo.color || DEFAULT_TIPO_ACTIVO_COLOR }}
        >
          <Icon className="size-2.5" />
        </span>
        <span className="truncate">{option.label}</span>
      </span>
    )
  }

  const renderTipoValor = (option: OptionsComboboxOption) => (
    <span className="flex min-w-0 items-center gap-2 truncate">
      <span
        className="flex size-4 shrink-0 items-center justify-center rounded-sm text-white"
        style={{ backgroundColor: selectedColor }}
      >
        <SelectedIcon className="size-2.5" />
      </span>
      <span className="truncate">{option.label}</span>
    </span>
  )

  const renderEstadoOption = (option: OptionsComboboxOption) => {
    const estado = estadosOperativos.find((item) => item.id === option.value)
    return (
      <span className="flex min-w-0 items-center gap-2 truncate text-xs">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: estado?.color || "#10B981" }}
        />
        <span className="font-medium">{option.label}</span>
        {estado?.codigo ? (
          <span className="text-[10px] font-mono text-muted-foreground">
            {estado.codigo}
          </span>
        ) : null}
      </span>
    )
  }

  const renderEstadoValor = (option: OptionsComboboxOption) => {
    const estado = estadosOperativos.find((item) => item.id === option.value)
    return (
      <span className="flex min-w-0 items-center gap-2 truncate">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: estado?.color || "#10B981" }}
        />
        <span className="truncate font-medium text-xs">{option.label}</span>
        {estado?.codigo ? (
          <span className="text-[10.5px] font-mono text-muted-foreground">
            ({estado.codigo})
          </span>
        ) : null}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Información General */}
      <FormSection
        step={1}
        title="Información General"
        description="Identificación principal, tipología y código patrimonial del activo."
        icon={FileText}
        badge={
          selectedTipo ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border/60">
              <span
                className="size-2 rounded-full inline-block"
                style={{ backgroundColor: selectedColor }}
              />
              {selectedTipo.nombre}
            </span>
          ) : null
        }
        columns={2}
      >
        <form.Field name="tipoActivoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Tipo de activo
                </RequiredFieldLabel>
                <OptionsCombobox
                  options={tipoOptions}
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  id={field.name}
                  name={field.name}
                  placeholder="Selecciona un tipo"
                  ariaLabel="Tipo de activo"
                  disabled={tiposQueryLoading}
                  aria-invalid={isInvalid}
                  renderOption={renderTipoOption}
                  renderValue={renderTipoValor}
                  emptyMessage="No se encontraron tipos de activo"
                />
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
                  placeholder="Ej. VEH-001"
                  className="font-mono text-sm"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="codigoAlternativo">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  Código Alternativo
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Ej. ALT-001 (opcional)"
                  className="font-mono text-sm"
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
              <Field
                data-invalid={isInvalid || undefined}
                className="col-span-1 md:col-span-2"
              >
                <RequiredFieldLabel htmlFor={field.name}>
                  Nombre del Activo
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
                  placeholder="Ej. Vagoneta Toyota Hilux"
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
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    Fecha de Adquisición
                  </span>
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
      </FormSection>

      {/* 2. Clasificación & Ubicación */}
      <FormSection
        step={2}
        title="Clasificación & Ubicación"
        description="Localización en planta o sede física y descripción extendida."
        icon={MapPin}
        columns={2}
      >
        <form.Field name="ubicacionId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selectedUbicacion =
              ubicacionesById.get(field.state.value ?? "") ?? null

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    Ubicación Física
                  </span>
                </FieldLabel>
                <Combobox
                  items={ubicaciones}
                  itemToStringLabel={(item: Ubicacion) =>
                    item ? `${item.codigo} - ${item.nombre}` : ""
                  }
                  itemToStringValue={(item: Ubicacion) => item?.id ?? ""}
                  value={selectedUbicacion}
                  onValueChange={(val: Ubicacion | null) =>
                    field.handleChange(val?.id ?? "")
                  }
                  disabled={ubicacionesLoading}
                >
                  <ComboboxInput
                    id={field.name}
                    placeholder="Buscar o seleccionar ubicación…"
                    showClear={Boolean(field.state.value)}
                    aria-invalid={isInvalid}
                    className="w-full"
                  />
                  <ComboboxContent className="z-50 max-h-60 min-w-[280px]">
                    <ComboboxEmpty>No se encontraron ubicaciones.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: Ubicacion) => {
                        const cfg = TIPO_UBICACION_CONFIG[item.tipo]
                        const LocIcon = cfg?.icon || MapPin
                        return (
                          <ComboboxItem key={item.id} value={item}>
                            <div className="flex items-center gap-2 truncate">
                              <LocIcon className="size-3.5 text-muted-foreground shrink-0" />
                              <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded shrink-0">
                                {item.codigo}
                              </code>
                              <span className="truncate">{item.nombre}</span>
                            </div>
                          </ComboboxItem>
                        )
                      }}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="estadoOperativoId">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  <span className="inline-flex items-center gap-1.5">
                    <Activity className="size-3.5 text-muted-foreground" />
                    Estado Operativo
                  </span>
                </FieldLabel>
                <OptionsCombobox
                  options={estadoOptions}
                  value={field.state.value ?? ""}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    onEstadoChange?.(value)
                  }}
                  id={field.name}
                  name={field.name}
                  placeholder="Selecciona estado operativo"
                  ariaLabel="Estado Operativo"
                  disabled={
                    estadosLoading ||
                    Boolean(estadosErrorMessage) ||
                    estadosOperativos.length === 0
                  }
                  aria-invalid={isInvalid}
                  renderOption={renderEstadoOption}
                  renderValue={renderEstadoValor}
                  emptyMessage="No se encontraron estados operativos"
                />
                {estadosErrorMessage ? (
                  <p className="text-xs text-destructive">{estadosErrorMessage}</p>
                ) : null}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <div className="col-span-1 md:col-span-2">
          <form.Field name="descripcion">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field data-invalid={isInvalid || undefined}>
                  <FieldLabel htmlFor={field.name}>Descripción y Observaciones</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Detalles adicionales, número de serie de fábrica, notas de estado u observaciones."
                    rows={4}
                    className="min-h-[100px] leading-relaxed resize-y"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          </form.Field>
        </div>
      </FormSection>
    </div>
  )
}
