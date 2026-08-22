import { z } from "zod"

export const tipoAprobadorEnum = z.enum([
  "EMPLEADO",
  "CARGO",
  "RESPONSABILIDAD",
])
export type TipoAprobador = z.infer<typeof tipoAprobadorEnum>

export const grupoAprobadorDetalleSchema = z
  .object({
    tipoAprobador: tipoAprobadorEnum,
    empleadoId: z.string().optional().nullable(),
    cargoId: z.string().optional().nullable(),
    responsabilidadId: z.string().optional().nullable(),
    orden: z
      .number()
      .int("El orden debe ser un número entero")
      .min(0, "El orden no puede ser menor a 0"),
    requiereAprobacion: z.boolean(),
  })
  .refine(
    (data) => {
      switch (data.tipoAprobador) {
        case "EMPLEADO":
          return Boolean(data.empleadoId)
        case "CARGO":
          return Boolean(data.cargoId)
        case "RESPONSABILIDAD":
          return Boolean(data.responsabilidadId)
      }
    },
    {
      message:
        "Debe seleccionar la referencia correspondiente al tipo de aprobador",
      path: ["tipoAprobador"],
    },
  )

export type GrupoAprobadorDetalleDto = z.infer<
  typeof grupoAprobadorDetalleSchema
>

export const defaultGrupoAprobadorDetalleValues: GrupoAprobadorDetalleDto = {
  tipoAprobador: "EMPLEADO",
  empleadoId: null,
  cargoId: null,
  responsabilidadId: null,
  orden: 1,
  requiereAprobacion: true,
}
