import { z } from "zod"

export const tipoSolicitudVehicularSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(50, "El código no puede superar los 50 caracteres"),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  diasAnticipacion: z
    .number({
      message: "Debe ingresar un número válido de días",
    })
    .int("Debe ser un número entero")
    .min(0, "Los días de anticipación no pueden ser negativos"),
  requiereRespaldo: z.boolean(),
  requiereJustificacion: z.boolean(),
})

export type TipoSolicitudVehicularFormValues = z.infer<
  typeof tipoSolicitudVehicularSchema
>

export const defaultTipoSolicitudVehicularValues: TipoSolicitudVehicularFormValues = {
  codigo: "",
  nombre: "",
  descripcion: "",
  diasAnticipacion: 0,
  requiereRespaldo: false,
  requiereJustificacion: false,
}

