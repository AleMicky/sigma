import type { ComponentType } from "react"
import { Calendar, FileText, MapPin } from "lucide-react"

import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import type { Ubicacion } from "@/modules/parametros/ubicacion/api/ubicacion.service"
import { TIPO_UBICACION_CONFIG } from "@/modules/parametros/ubicacion/components/TipoUbicacionBadge"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
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
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

type ActivoFormMainSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  tipos: TipoActivo[]
  tiposById: Map<string, TipoActivo>
  selectedTipo?: TipoActivo
  selectedColor: string
  SelectedIcon: ComponentType<{ className?: string }>
  tiposQueryLoading: boolean
  ubicaciones?: Ubicacion[]
  ubicacionesById?: Map<string, Ubicacion>
  ubicacionesLoading?: boolean
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
}: ActivoFormMainSectionProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2.5">
          <FileText className="size-4 text-primary" />
          <h2 className="font-heading font-semibold text-base">
            Información Principal
          </h2>
        </div>
        {selectedTipo ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border/60">
            <span
              className="size-2 rounded-full inline-block"
              style={{ backgroundColor: selectedColor }}
            />
            {selectedTipo.nombre}
          </span>
        ) : null}
      </div>

      <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form.Field name="tipoActivoId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
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
                  onValueChange={(value) => field.handleChange(value ?? "")}
                  disabled={tiposQueryLoading}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Selecciona un tipo">
                      {selected ? (
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="flex size-4 shrink-0 items-center justify-center rounded-sm text-white"
                            style={{
                              backgroundColor:
                                selected.color || DEFAULT_TIPO_ACTIVO_COLOR,
                            }}
                          >
                            <SelectedIcon className="size-2.5" />
                          </span>
                          <span>{selected.nombre}</span>
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((tipo) => {
                      const Icon = getTipoActivoIcon(tipo.icono)
                      const color = tipo.color || DEFAULT_TIPO_ACTIVO_COLOR
                      return (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="flex size-4 shrink-0 items-center justify-center rounded-sm text-white"
                              style={{ backgroundColor: color }}
                            >
                              <Icon className="size-2.5" />
                            </span>
                            <span>{tipo.nombre}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="codigo">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
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

        <form.Field name="nombre">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
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
                  placeholder="Ej. Vagoneta"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="ubicacionId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selectedUbicacion =
              ubicacionesById.get(field.state.value) ?? null

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    Ubicación
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

        <form.Field name="fechaAdquisicion">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
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

        <form.Field name="descripcion">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field
                data-invalid={isInvalid || undefined}
                className="md:col-span-2"
              >
                <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Detalles adicionales, notas de estado u observaciones."
                  rows={3}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </FieldGroup>
    </div>
  )
}
