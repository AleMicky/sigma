import { z } from "zod"

export const personaSchema = z.object({
  tipoDocumento: z
    .string()
    .min(2, "El tipo de documento debe tener al menos 2 caracteres")
    .max(20, "El tipo de documento no puede superar 20 caracteres"),
  numeroDocumento: z
    .string()
    .min(2, "El número de documento debe tener al menos 2 caracteres")
    .max(50, "El número de documento no puede superar 50 caracteres"),
  complemento: z
    .string()
    .max(10, "El complemento no puede superar 10 caracteres")
    .optional()
    .nullable(),
  nombres: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(100, "Los nombres no pueden superar 100 caracteres"),
  primerApellido: z
    .string()
    .min(2, "El primer apellido debe tener al menos 2 caracteres")
    .max(100, "El primer apellido no puede superar 100 caracteres"),
  segundoApellido: z
    .string()
    .max(100, "El segundo apellido no puede superar 100 caracteres")
    .optional()
    .nullable(),
  fechaNacimiento: z.string().optional().nullable(),
  telefono: z
    .string()
    .max(30, "El teléfono no puede superar 30 caracteres")
    .optional()
    .nullable(),
  correo: z
    .string()
    .email("Ingrese un correo electrónico válido")
    .max(150, "El correo no puede superar 150 caracteres")
    .or(z.literal(""))
    .optional()
    .nullable(),
})

export type PersonaDto = z.infer<typeof personaSchema>

export const defaultPersonaValues: PersonaDto = {
  tipoDocumento: "CI",
  numeroDocumento: "",
  complemento: "",
  nombres: "",
  primerApellido: "",
  segundoApellido: "",
  fechaNacimiento: "",
  telefono: "",
  correo: "",
}
