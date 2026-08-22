import { z } from "zod"

export const grupoAprobadorDependienteSchema = z.object({
  empleadoId: z.string().min(1, "El empleado es obligatorio"),
})

export type GrupoAprobadorDependienteDto = z.infer<
  typeof grupoAprobadorDependienteSchema
>

export const defaultGrupoAprobadorDependienteValues: GrupoAprobadorDependienteDto = {
  empleadoId: "",
}
