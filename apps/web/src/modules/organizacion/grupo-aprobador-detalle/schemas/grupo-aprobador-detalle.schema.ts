import { z } from "zod"

export const tipoAprobadorEnum = z.enum([
  "EMPLEADO",
  "CARGO",
  "UNIDAD",
  "RESPONSABILIDAD",
])
export type TipoAprobador = z.infer<typeof tipoAprobadorEnum>

export const alcanceAprobadorEnum = z.enum(["GLOBAL", "UNIDAD_ESPECIFICA"])
export type AlcanceAprobador = z.infer<typeof alcanceAprobadorEnum>

export const grupoAprobadorDetalleSchema = z
  .object({
    tipoAprobador: tipoAprobadorEnum,
    empleadoId: z.string().optional().nullable(),
    cargoId: z.string().optional().nullable(),
    unidadId: z.string().optional().nullable(),
    responsabilidadId: z.string().optional().nullable(),
    alcance: alcanceAprobadorEnum,
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
        case "UNIDAD":
          return Boolean(data.unidadId)
        case "RESPONSABILIDAD":
          return Boolean(data.responsabilidadId)
      }
    },
    {
      message: "Debe seleccionar la referencia correspondiente al tipo de aprobador",
      path: ["tipoAprobador"],
    },
  )
  .refine(
    (data) => {
      if (data.alcance === "UNIDAD_ESPECIFICA") {
        return Boolean(data.unidadId)
      }
      return true
    },
    {
      message: "La unidad es obligatoria cuando el alcance es por unidad específica",
      path: ["unidadId"],
    },
  )

export type GrupoAprobadorDetalleDto = z.infer<
  typeof grupoAprobadorDetalleSchema
>

export const defaultGrupoAprobadorDetalleValues: GrupoAprobadorDetalleDto = {
  tipoAprobador: "EMPLEADO",
  empleadoId: null,
  cargoId: null,
  unidadId: null,
  responsabilidadId: null,
  alcance: "GLOBAL",
  orden: 1,
  requiereAprobacion: true,
}
