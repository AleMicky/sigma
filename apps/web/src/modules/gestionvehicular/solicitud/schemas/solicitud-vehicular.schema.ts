import { z } from "zod"

export const solicitudVehicularSchema = z
  .object({
    numero: z
      .string()
      .trim()
      .max(50, "El número no puede superar los 50 caracteres")
      .optional()
      .or(z.literal("")),
    tipoSolicitudVehicularId: z
      .string()
      .trim()
      .min(1, "Debe seleccionar un tipo de solicitud vehicular"),
    solicitanteId: z
      .string()
      .trim()
      .min(1, "Debe seleccionar un solicitante"),
    motivo: z
      .string()
      .trim()
      .min(3, "El motivo debe tener al menos 3 caracteres")
      .max(500, "El motivo no puede superar los 500 caracteres"),
    justificacion: z
      .string()
      .trim()
      .max(1000, "La justificación no puede superar los 1000 caracteres")
      .optional()
      .or(z.literal("")),
    destino: z
      .string()
      .trim()
      .min(2, "El destino es obligatorio")
      .max(255, "El destino no puede superar los 255 caracteres"),
    fechaSalida: z
      .string()
      .trim()
      .min(1, "La fecha de salida es obligatoria"),
    fechaRetornoEstimada: z
      .string()
      .trim()
      .min(1, "La fecha de retorno estimada es obligatoria"),
    cantidadPasajeros: z
      .number({
        message: "Debe ingresar una cantidad válida de pasajeros",
      })
      .int("Debe ser un número entero")
      .min(1, "La cantidad de pasajeros debe ser al menos 1"),
    observacion: z
      .string()
      .trim()
      .max(1000, "La observación no puede superar los 1000 caracteres")
      .optional()
      .or(z.literal("")),
    estado: z
      .string()
      .trim()
      .max(30, "El estado no puede superar los 30 caracteres")
      .optional()
      .or(z.literal("")),
    processInstanceId: z
      .string()
      .trim()
      .max(100, "El processInstanceId no puede superar los 100 caracteres")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.fechaSalida || !data.fechaRetornoEstimada) return true
      const salida = new Date(data.fechaSalida).getTime()
      const retorno = new Date(data.fechaRetornoEstimada).getTime()
      return !isNaN(salida) && !isNaN(retorno) ? retorno >= salida : true
    },
    {
      message: "La fecha de retorno estimada debe ser posterior o igual a la fecha de salida",
      path: ["fechaRetornoEstimada"],
    }
  )

export type SolicitudVehicularFormValues = z.infer<
  typeof solicitudVehicularSchema
>

export const defaultSolicitudVehicularValues: SolicitudVehicularFormValues = {
  numero: "",
  tipoSolicitudVehicularId: "",
  solicitanteId: "",
  motivo: "",
  justificacion: "",
  destino: "",
  fechaSalida: "",
  fechaRetornoEstimada: "",
  cantidadPasajeros: 1,
  observacion: "",
  estado: "PENDIENTE",
  processInstanceId: "",
}
