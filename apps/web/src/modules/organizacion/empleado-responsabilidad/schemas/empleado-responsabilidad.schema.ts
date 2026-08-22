import { z } from "zod"

export const empleadoResponsabilidadSchema = z
  .object({
    empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
    responsabilidadId: z.string().min(1, "La responsabilidad es obligatoria"),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return new Date(data.fechaFin) >= new Date(data.fechaInicio)
      }
      return true
    },
    {
      message: "La fecha de fin no puede ser anterior a la fecha de inicio",
      path: ["fechaFin"],
    },
  )

export type EmpleadoResponsabilidadDto = z.infer<
  typeof empleadoResponsabilidadSchema
>

export const defaultEmpleadoResponsabilidadValues: EmpleadoResponsabilidadDto = {
  empleadoId: "",
  responsabilidadId: "",
  fechaInicio: new Date().toISOString().split("T")[0],
  fechaFin: "",
}
