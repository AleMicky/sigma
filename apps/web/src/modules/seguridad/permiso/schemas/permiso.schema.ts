import { z } from "zod"

export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
] as const

export const permisoSchema = z.object({
  menuId: z.string().min(1, "El menú es obligatorio"),
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(200, "El código no puede superar los 200 caracteres")
    .regex(
      /^[A-Za-z0-9_:\-*]+$/,
      "El código solo puede contener letras, números, guiones y guiones bajos (ej: CREAR_USUARIO)",
    ),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "El nombre no puede superar los 200 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  metodoHttp: z
    .string()
    .min(1, "El método HTTP es obligatorio")
    .max(10, "El método HTTP no puede superar los 10 caracteres"),
  ruta: z
    .string()
    .trim()
    .min(1, "La ruta es obligatoria")
    .max(500, "La ruta no puede superar los 500 caracteres")
    .startsWith("/", "La ruta debe comenzar con '/' (ej: /api/v1/usuarios)"),
  activo: z.boolean(),
})

export type PermisoFormValues = z.infer<typeof permisoSchema>

export const defaultPermisoValues: PermisoFormValues = {
  menuId: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  metodoHttp: "GET",
  ruta: "/api/v1/",
  activo: true,
}
