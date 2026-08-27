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
    .max(100, "El icono no puede superar los 100 caracteres"),
  ruta: z
    .string()
    .max(300, "La ruta no puede superar los 300 caracteres"),
  menuPadreId: z.string(),
  orden: z
    .string()
    .refine(
      (val) => val === "" || (/^\d+$/.test(val) && Number(val) >= 0),
      "El orden debe ser un número entero positivo",
    )
    .refine(
      (val) => val === "" || Number(val) <= 2147483647,
      "El orden excede el valor máximo permitido",
    ),
  activo: z.boolean(),
})

export type MenuFormValues = z.infer<typeof menuSchema>

export const defaultMenuValues: MenuFormValues = {
  codigo: "",
  nombre: "",
  icono: "",
  ruta: "",
  menuPadreId: "__none__",
  orden: "1",
  activo: true,
}
