import { z } from "zod"

export const tipoPreguntaEnum = z.enum([
  "ESTRELLAS_1_5",
  "ESCALA_1_5",
  "SI_NO",
  "OPCION_UNICA",
  "OPCION_MULTIPLE",
  "TEXTO_CORTO",
  "TEXTO_LARGO",
  "NUMERICO",
])

export const cuestionarioFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede superar 50 caracteres")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Solo se permiten letras, números, guiones y guiones bajos",
    ),
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(150, "El nombre no puede superar 150 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres"),
  moduloOrigen: z
    .string()
    .trim()
    .min(1, "Selecciona un disparador de proceso"),
  entidadTipo: z
    .string()
    .trim()
    .min(1, "Selecciona un disparador de proceso"),
  eventoDisparador: z
    .string()
    .trim()
    .min(1, "Selecciona un disparador de proceso"),
  obligatorio: z.boolean(),
  anonimoEnReportes: z.boolean(),
})

export type CuestionarioFormValues = z.infer<typeof cuestionarioFormSchema>

export const preguntaOpcionSchema = z.object({
  id: z.string().optional(),
  orden: z.number().int().min(1),
  etiqueta: z
    .string()
    .trim()
    .min(1, "La etiqueta de la opción es obligatoria")
    .max(120, "La etiqueta no puede superar 120 caracteres"),
  valor: z
    .string()
    .trim()
    .min(1, "El valor interno es obligatorio")
    .max(80, "El valor no puede superar 80 caracteres"),
  puntaje: z.number().nullable().optional(),
  activo: z.boolean().optional(),
})

export const preguntaItemSchema = z
  .object({
    id: z.string().optional(),
    seccion: z
      .string()
      .trim()
      .max(100, "La sección no puede superar 100 caracteres")
      .nullable()
      .optional(),
    orden: z.number().int().min(1),
    enunciado: z
      .string()
      .trim()
      .min(3, "El enunciado debe tener al menos 3 caracteres")
      .max(300, "El enunciado no puede superar 300 caracteres"),
    descripcionAyuda: z
      .string()
      .trim()
      .max(300, "La ayuda no puede superar 300 caracteres")
      .nullable()
      .optional(),
    tipoPregunta: tipoPreguntaEnum,
    obligatoria: z.boolean(),
    peso: z
      .number()
      .min(0, "El peso no puede ser negativo")
      .nullable()
      .optional(),
    activo: z.boolean().optional(),
    opciones: z.array(preguntaOpcionSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.tipoPregunta === "OPCION_UNICA" ||
      data.tipoPregunta === "OPCION_MULTIPLE"
    ) {
      const opcionesActivas = (data.opciones ?? []).filter(
        (opt) => opt.activo !== false,
      )
      if (opcionesActivas.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["opciones"],
          message:
            "Las preguntas de selección requieren al menos 2 opciones activas",
        })
      }
    }
  })

export const guardarPreguntasSchema = z.object({
  preguntas: z
    .array(preguntaItemSchema)
    .min(1, "Debes agregar al menos una pregunta al cuestionario"),
})

export const responderComentarioSchema = z.object({
  comentarioGeneral: z
    .string()
    .trim()
    .max(1000, "El comentario no puede superar 1000 caracteres"),
})
