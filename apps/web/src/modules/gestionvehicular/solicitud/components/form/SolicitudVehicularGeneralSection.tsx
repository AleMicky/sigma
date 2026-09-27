import { CalendarClock, FileCheck, Layers, Loader2, ShieldAlert } from "lucide-react"

import { EmpleadoCombobox } from "@/modules/organizacion/empleado/components/EmpleadoCombobox"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Field, FieldError } from "@/shared/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { useSolicitudVehicularFormContext } from "../../context/solicitud-vehicular-form.context"

export function SolicitudVehicularGeneralSection() {
  const { form, tiposList, tiposLoading, registerEmpleado } =
    useSolicitudVehicularFormContext()

  return (
    <div className="p-3 sm:p-3.5 space-y-2.5">
      {/* Encabezado de Sección */}
      <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
        <div className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-[10.5px] ring-1 ring-primary/20 shrink-0">
          1
        </div>
        <h2 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
          <span>Clasificación y Solicitante</span>
          <Layers className="size-3 text-muted-foreground/60" />
        </h2>
      </div>

      {/* FILA: SOLICITANTE Y TIPO DE SOLICITUD (2 Columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
        {/* Empleado Solicitante */}
        <form.Field name="solicitanteId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid || undefined} className="space-y-1">
                <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                  Empleado Solicitante
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
                  placeholder="Buscar solicitante..."
                  className="w-full text-xs h-8.5 rounded-lg"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        {/* Tipo de Solicitud */}
        <form.Field name="tipoSolicitudVehicularId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selectedTipo = tiposList.find(
              (t) => t.id === field.state.value
            )

            return (
              <Field data-invalid={isInvalid || undefined} className="space-y-1">
                <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                  Tipo de Solicitud Vehicular
                </RequiredFieldLabel>

                {tiposLoading ? (
                  <div className="flex items-center gap-2 h-8.5 px-3 rounded-lg border border-border/70 bg-muted/40 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>Cargando tipos...</span>
                  </div>
                ) : (
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => {
                      if (val) field.handleChange(val)
                    }}
                  >
                    <SelectTrigger className="h-8.5 shadow-2xs text-xs rounded-lg">
                      <SelectValue placeholder="Seleccione tipo de solicitud...">
                        {selectedTipo ? selectedTipo.nombre : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tiposList.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{tipo.nombre}</span>
                            <span className="text-muted-foreground text-[10px]">
                              ({tipo.codigo})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Resumen dinámico del tipo seleccionado */}
                {selectedTipo && (
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[9.5px] font-medium px-1.5 py-0 gap-1 bg-muted/50 text-muted-foreground border-border/70"
                    >
                      <CalendarClock className="size-2.5 text-muted-foreground" />
                      Anticipación: {selectedTipo.diasAnticipacion}d
                    </Badge>
                    {selectedTipo.requiereRespaldo && (
                      <Badge
                        variant="outline"
                        className="text-[9.5px] font-medium px-1.5 py-0 gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                      >
                        <FileCheck className="size-2.5 text-blue-600 dark:text-blue-400" />
                        Requiere respaldo
                      </Badge>
                    )}
                    {selectedTipo.requiereJustificacion && (
                      <Badge
                        variant="outline"
                        className="text-[9.5px] font-medium px-1.5 py-0 gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900"
                      >
                        <ShieldAlert className="size-2.5 text-purple-600 dark:text-purple-400" />
                        Justificación req.
                      </Badge>
                    )}
                  </div>
                )}
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>
      </div>
    </div>
  )
}
