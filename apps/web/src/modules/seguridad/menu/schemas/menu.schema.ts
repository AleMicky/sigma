import { z } from "zod"

export const menuSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(100, "El código no puede superar los 100 caracteres"),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  icono: z
    .string()
    .trim()
    .max(100, "El icono no puede superar los 100 caracteres")
    .optional()
    .nullable(),
  ruta: z
    .string()
    .trim()
    .max(300, "La ruta no puede superar los 300 caracteres")
    .optional()
    .nullable(),
  menuPadreId: z.string(),
  orden: z
    .number()
    .min(0, "El orden no puede ser menor a 0")
    .max(2147483647, "El orden excede el valor máximo permitido"),
  activo: z.boolean(),
})

export type MenuFormValues = z.infer<typeof menuSchema>

export const defaultMenuValues: MenuFormValues = {
  codigo: "",
  nombre: "",
  icono: "folder",
  ruta: "",
  menuPadreId: "__none__",
  orden: 10,
  activo: true,
}
