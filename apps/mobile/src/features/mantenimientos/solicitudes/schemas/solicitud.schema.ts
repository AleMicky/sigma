import { z } from "zod";

export const createSolicitudSchema = z.object({
    titulo: z
        .string()
        .trim()
        .min(1, { message: "El título es obligatorio." })
        .min(3, { message: "El título debe tener al menos 3 caracteres." })
        .max(150, { message: "El título no puede superar los 150 caracteres." }),
    descripcion: z
        .string()
        .trim()
        .min(1, { message: "La descripción es obligatoria." })
        .min(5, { message: "La descripción debe tener al menos 5 caracteres." })
        .max(2000, { message: "La descripción no puede superar los 2000 caracteres." }),
    tipoFallas: z
        .string()
        .trim()
        .max(200, { message: "El tipo de falla no puede superar los 200 caracteres." })
        .optional()
        .nullable(),
    activoId: z
        .string()
        .min(1, { message: "Debe seleccionar un activo o equipo afectado." }),
    tipoMantenimientoId: z
        .string()
        .min(1, { message: "Debe seleccionar un tipo de mantenimiento." }),
    prioridadId: z
        .string()
        .min(1, { message: "Debe seleccionar una prioridad." }),
    solicitanteId: z
        .string()
        .min(1, { message: "Debe especificar el personal solicitante." }),
    fechaSolicitud: z
        .string()
        .optional()
        .nullable(),
});

export type CreateSolicitudFormValues = z.infer<typeof createSolicitudSchema>;

export const defaultCreateSolicitudValues: CreateSolicitudFormValues = {
    titulo: "",
    descripcion: "",
    tipoFallas: "",
    activoId: "",
    tipoMantenimientoId: "",
    prioridadId: "",
    solicitanteId: "",
    fechaSolicitud: new Date().toISOString().substring(0, 16),
};
