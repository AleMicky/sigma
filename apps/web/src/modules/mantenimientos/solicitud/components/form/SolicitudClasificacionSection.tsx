import { Check, Layers, Loader2 } from "lucide-react"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { CatalogoCombobox } from "@/shared/components/catalogo-combobox"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"
import { useSolicitudFormContext } from "../../context/solicitud-form.context"
import {
  getPrioridadColorConfig,
  getTipoMantenimientoBadgeClass,
} from "../../lib/solicitud.utils"

export function SolicitudClasificacionSection() {
  const {
    form,
    tiposMantenimiento,
    tiposMantenimientoLoading,
    prioridades,
    prioridadesLoading,
    prioridadesMap,
    registerEmpleado,
  } = useSolicitudFormContext()

  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-4">
      {/* Encabezado de Sección */}
      <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
        <div className="flex size-6.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Layers className="size-3.5" />
        </div>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
            1. Clasificación y Solicitante
          </h2>
        </div>
      </div>

      {/* Título de la Solicitud */}
      <form.Field name="titulo">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Título de la Solicitud
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
                className="h-9.5 text-xs sm:text-sm shadow-2xs"
              />
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>

      {/* Tipo de Mantenimiento (Badges interactivos) */}
      <form.Field name="tipoMantenimientoId">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Tipo de Mantenimiento
              </RequiredFieldLabel>

              {tiposMantenimientoLoading ? (
                <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Cargando tipos de mantenimiento...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {tiposMantenimiento.map((tm) => {
                    const isSelected = field.state.value === tm.id

                    return (
                      <button
                        key={tm.id}
                        type="button"
                        onClick={() => field.handleChange(tm.id)}
                        className={cn(
                          "group inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs transition-all cursor-pointer shadow-2xs active:scale-95 border",
                          getTipoMantenimientoBadgeClass(tm.nombre, isSelected),
                        )}
                      >
                        {isSelected ? (
                          <Check className="size-3.5 shrink-0 text-white stroke-[2.5]" />
                        ) : (
                          <div className="size-2 rounded-full border border-muted-foreground/50 shrink-0 group-hover:border-primary/60" />
                        )}
                        <span className="capitalize tracking-tight">{tm.nombre}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>

      {/* Solicitante Selector */}
      <form.Field name="solicitanteId">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <Field data-invalid={isInvalid || undefined}>
              <RequiredFieldLabel htmlFor={field.name}>
                Personal Solicitante
              </RequiredFieldLabel>

              <EmpleadoCombobox
                id={field.name}
                name={field.name}
                value={field.state.value}
                onValueChange={(val, emp) => {
                  field.handleChange(val)
                  if (emp) registerEmpleado(emp)
                }}
                onBlur={field.handleBlur}
                aria-invalid={isInvalid}
                onlyMisEmpleados={true}
                placeholder="Buscar solicitante por nombre, código o cargo..."
                className="h-9.5 text-xs sm:text-sm"
              />

              {isInvalid && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )
        }}
      </form.Field>

      {/* Tipo de Falla y Nivel de Prioridad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
        <form.Field name="tipoFallas">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={field.name}>
                  Tipo de Falla
                </FieldLabel>
                <CatalogoCombobox
                  codigo="TIPO_FALLAS"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onValueChange={(val) => field.handleChange(val)}
                  aria-invalid={isInvalid}
                  placeholder="Seleccionar o describir falla..."
                  maxLength={200}
                  allowCustomValue={true}
                  className="h-9.5 text-xs sm:text-sm"
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="prioridadId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selected = prioridadesMap.get(field.state.value)
            const cfg = selected
              ? getPrioridadColorConfig(selected.nivel)
              : null

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name}>
                  Nivel de Prioridad
                </RequiredFieldLabel>
                <Select
                  value={field.state.value || null}
                  onValueChange={(value) =>
                    field.handleChange(value ?? "")
                  }
                  disabled={prioridadesLoading}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    className={cn(
                      "w-full h-9.5 shadow-2xs text-xs sm:text-sm transition-all",
                      cfg && cfg.borderClass,
                    )}
                  >
                    <SelectValue placeholder="Seleccionar Prioridad">
                      {selected && cfg ? (
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`size-2.5 rounded-full inline-block shrink-0 ${cfg.dotClass}`}
                          />
                          <span className="truncate font-semibold text-foreground text-xs">
                            {selected.nombre}
                          </span>
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {prioridades.map((p) => {
                      const pCfg = getPrioridadColorConfig(p.nivel)
                      return (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          className="text-xs cursor-pointer py-2"
                        >
                          <div className="flex items-center justify-between gap-2 w-full min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`size-2.5 rounded-full inline-block shrink-0 ${pCfg.dotClass}`}
                              />
                              <span className="truncate font-medium text-foreground">
                                {p.nombre}
                              </span>
                            </div>
                            {p.porDefecto && (
                              <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border/60 shrink-0">
                                Por defecto
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )
          }}
        </form.Field>
      </div>
    </div>
  )
}
