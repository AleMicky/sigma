import { z } from "zod"

export const prioridadSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede superar los 30 caracteres")
    .regex(
      /^[A-Z0-9_-]+$/,
      "El código solo debe contener mayúsculas, números, guiones y guiones bajos",
    ),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  descripcion: z
    .string()
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional()
    .or(z.literal("")),
  nivel: z
    .number({ message: "El nivel debe ser un número" })
    .int("El nivel debe ser un número entero")
    .min(1, "El nivel mínimo es 1")
    .max(5, "El nivel máximo es 5"),
  porDefecto: z.boolean(),
})

export type PrioridadFormValues = z.infer<typeof prioridadSchema>

export const defaultPrioridadValues: PrioridadFormValues = {
  codigo: "",
  nombre: "",
  descripcion: "",
  nivel: 1,
  porDefecto: false,
}
