import { Layers, Loader2 } from "lucide-react"

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
      <div className="flex items-center gap-1.5 pb-1 border-b border-border/40">
        <div className="flex size-5.5 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <Layers className="size-3" />
        </div>
        <h2 className="text-xs font-semibold text-foreground tracking-tight">
          1. Clasificación y Solicitante
        </h2>
      </div>

      {/* FILA: SOLICITANTE Y TIPO DE SOLICITUD (2 Columnas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
        <form.Field name="solicitanteId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid || undefined}>
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
                  className="w-full text-xs"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        </form.Field>

        <form.Field name="tipoSolicitudVehicularId">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(field: any) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const selectedTipo = tiposList.find(
              (t) => t.id === field.state.value
            )

            return (
              <Field data-invalid={isInvalid || undefined}>
                <RequiredFieldLabel htmlFor={field.name} className="text-xs">
                  Tipo de Solicitud Vehicular
                </RequiredFieldLabel>

                {tiposLoading ? (
                  <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Cargando tipos...</span>
                  </div>
                ) : (
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => {
                      if (val) field.handleChange(val)
                    }}
                  >
                    <SelectTrigger className="h-8.5 shadow-2xs text-xs">
                      <SelectValue placeholder="Seleccione tipo de solicitud...">
                        {selectedTipo ? selectedTipo.nombre : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {tiposList.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{tipo.nombre}</span>
                            <span className="text-muted-foreground text-[10px]">
                              ({tipo.codigo})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {selectedTipo && (
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[9.5px] px-1.5 py-0">
                      Anticipación: {selectedTipo.diasAnticipacion}d
                    </Badge>
                    {selectedTipo.requiereRespaldo && (
                      <Badge
                        variant="outline"
                        className="text-[9.5px] px-1.5 py-0 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        Respaldo requerido
                      </Badge>
                    )}
                    {selectedTipo.requiereJustificacion && (
                      <Badge
                        variant="outline"
                        className="text-[9.5px] px-1.5 py-0 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                      >
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
