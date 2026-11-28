import { describe, expect, it } from "vitest"

import {
  cuestionarioFormSchema,
  guardarPreguntasSchema,
  preguntaItemSchema,
} from "./cuestionario.schema"

describe("cuestionarioFormSchema", () => {
  it("valida un cuestionario correcto con disparador completo", () => {
    const result = cuestionarioFormSchema.safeParse({
      codigo: "EVAL_COND_01",
      nombre: "Evaluación de conductores",
      descripcion: "Encuesta post viaje",
      moduloOrigen: "GESTION_VEHICULAR",
      entidadTipo: "SOLICITUD_VEHICULAR",
      eventoDisparador: "SOLICITUD_FINALIZADA",
      obligatorio: true,
      anonimoEnReportes: false,
    })

    expect(result.success).toBe(true)
  })

  it("rechaza código con caracteres inválidos o demasiado corto", () => {
    const result = cuestionarioFormSchema.safeParse({
      codigo: "A!",
      nombre: "Nombre válido",
      descripcion: "",
      moduloOrigen: "GESTION_VEHICULAR",
      entidadTipo: "SOLICITUD_VEHICULAR",
      eventoDisparador: "SOLICITUD_FINALIZADA",
      obligatorio: false,
      anonimoEnReportes: false,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "codigo")).toBe(true)
    }
  })

  it("exige disparador de proceso completo", () => {
    const result = cuestionarioFormSchema.safeParse({
      codigo: "EVAL-02",
      nombre: "Encuesta sin disparador",
      descripcion: "",
      moduloOrigen: "",
      entidadTipo: "",
      eventoDisparador: "",
      obligatorio: false,
      anonimoEnReportes: true,
    })

    expect(result.success).toBe(false)
  })
})

describe("preguntaItemSchema y guardarPreguntasSchema", () => {
  it("exige al menos 2 opciones activas en OPCION_UNICA y OPCION_MULTIPLE", () => {
    const invalidSingle = preguntaItemSchema.safeParse({
      orden: 1,
      enunciado: "¿Qué medio prefieres?",
      tipoPregunta: "OPCION_UNICA",
      obligatoria: true,
      opciones: [
        { orden: 1, etiqueta: "Única", valor: "UNICA", puntaje: 5, activo: true },
      ],
    })

    expect(invalidSingle.success).toBe(false)
    if (!invalidSingle.success) {
      expect(
        invalidSingle.error.issues.some((i) => i.path.includes("opciones")),
      ).toBe(true)
    }

    const validMultiple = preguntaItemSchema.safeParse({
      orden: 1,
      enunciado: "Aspectos destacados",
      tipoPregunta: "OPCION_MULTIPLE",
      obligatoria: false,
      opciones: [
        { orden: 1, etiqueta: "Puntualidad", valor: "PUNTUALIDAD", puntaje: 2 },
        { orden: 2, etiqueta: "Limpieza", valor: "LIMPIEZA", puntaje: 2 },
      ],
    })

    expect(validMultiple.success).toBe(true)
  })

  it("rechaza guardarPreguntasSchema si el arreglo está vacío", () => {
    const empty = guardarPreguntasSchema.safeParse({ preguntas: [] })
    expect(empty.success).toBe(false)
  })
})
