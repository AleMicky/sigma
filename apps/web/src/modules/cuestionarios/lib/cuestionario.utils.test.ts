import { describe, expect, it } from "vitest"

import { ApiError } from "@/shared/api"

import type {
  PreguntaCuestionario,
  RespuestaDetalle,
} from "../api/cuestionario.types"
import {
  buildDisparadorKey,
  buildResponderPayload,
  calculateProgresoRespuestas,
  formatDisparadorLabel,
  formatDisparadorOptionLabel,
  formatPorcentaje,
  isConflictActiveCuestionarioError,
  isPreguntaAnswered,
  mapRespuestasDetalleToDraftMap,
  parseDisparadorKey,
  slugifyOptionValue,
  validateRespuestas,
} from "./cuestionario.utils"

const samplePreguntas: PreguntaCuestionario[] = [
  {
    id: "p1",
    seccion: "General",
    orden: 1,
    enunciado: "Califica la puntualidad",
    descripcionAyuda: null,
    tipoPregunta: "ESTRELLAS_1_5",
    obligatoria: true,
    peso: 2,
    configJson: null,
    activo: true,
    opciones: [],
  },
  {
    id: "p2",
    seccion: "General",
    orden: 2,
    enunciado: "¿El vehículo estaba limpio?",
    descripcionAyuda: null,
    tipoPregunta: "SI_NO",
    obligatoria: true,
    peso: 1,
    configJson: null,
    activo: true,
    opciones: [],
  },
  {
    id: "p3",
    seccion: "Detalles",
    orden: 3,
    enunciado: "Aspectos a destacar",
    descripcionAyuda: null,
    tipoPregunta: "OPCION_MULTIPLE",
    obligatoria: false,
    peso: 1,
    configJson: null,
    activo: true,
    opciones: [
      { id: "o1", orden: 1, etiqueta: "Cortesía", valor: "CORTESIA", puntaje: 2, activo: true },
      { id: "o2", orden: 2, etiqueta: "Seguridad", valor: "SEGURIDAD", puntaje: 3, activo: true },
    ],
  },
  {
    id: "p4",
    seccion: "Detalles",
    orden: 4,
    enunciado: "Comentarios",
    descripcionAyuda: null,
    tipoPregunta: "TEXTO_LARGO",
    obligatoria: false,
    peso: 0,
    configJson: null,
    activo: true,
    opciones: [],
  },
]

describe("cuestionario.utils", () => {
  it("construye y parsea claves de disparador correctamente", () => {
    const key = buildDisparadorKey({
      moduloOrigen: "GESTION_VEHICULAR",
      entidadTipo: "SOLICITUD_VEHICULAR",
      eventoDisparador: "SOLICITUD_FINALIZADA",
    })
    expect(key).toBe(
      "GESTION_VEHICULAR::SOLICITUD_VEHICULAR::SOLICITUD_FINALIZADA",
    )
    expect(parseDisparadorKey(key)).toEqual({
      moduloOrigen: "GESTION_VEHICULAR",
      entidadTipo: "SOLICITUD_VEHICULAR",
      eventoDisparador: "SOLICITUD_FINALIZADA",
    })
    expect(parseDisparadorKey("invalido")).toBeNull()

    const disparador = {
      moduloOrigen: "GESTION_VEHICULAR",
      moduloEtiqueta: "Gestión Vehicular",
      entidadTipo: "SOLICITUD_VEHICULAR",
      entidadEtiqueta: "Solicitud de Vehículo",
      eventoDisparador: "AL_FINALIZAR",
      eventoEtiqueta: "Al finalizar viaje",
      descripcion: "Habilita evaluación",
      evaluadoTipoDefecto: "CONDUCTOR",
    }
    expect(formatDisparadorOptionLabel(disparador)).toBe(
      "Gestión Vehicular · Al finalizar viaje (Solicitud de Vehículo → Conductor)",
    )
    expect(
      formatDisparadorLabel(
        [disparador],
        "GESTION_VEHICULAR",
        "SOLICITUD_VEHICULAR",
        "AL_FINALIZAR",
      ),
    ).toBe("Gestión Vehicular · Al finalizar viaje")
  })

  it("evalúa si una pregunta fue respondida para los distintos tipos", () => {
    expect(
      isPreguntaAnswered({ tipoPregunta: "ESTRELLAS_1_5" }, { valorNumerico: "5" }),
    ).toBe(true)
    expect(
      isPreguntaAnswered({ tipoPregunta: "ESTRELLAS_1_5" }, { valorNumerico: "0" }),
    ).toBe(false)
    expect(
      isPreguntaAnswered({ tipoPregunta: "SI_NO" }, { valorBooleano: false }),
    ).toBe(true)
    expect(
      isPreguntaAnswered({ tipoPregunta: "OPCION_MULTIPLE" }, { opcionesIds: [] }),
    ).toBe(false)
    expect(
      isPreguntaAnswered(
        { tipoPregunta: "TEXTO_CORTO" },
        { valorTexto: "   " },
      ),
    ).toBe(false)
  })

  it("valida obligatorias y calcula el progreso", () => {
    const partial = {
      p1: { valorNumerico: "4" },
    }
    const errors = validateRespuestas(samplePreguntas, partial)
    expect(errors).toEqual({ p2: "Esta pregunta es obligatoria" })

    const progress = calculateProgresoRespuestas(samplePreguntas, partial)
    expect(progress).toEqual({
      totalActivas: 4,
      respondidas: 1,
      obligatoriasTotal: 2,
      obligatoriasRespondidas: 1,
      porcentaje: 25,
    })
  })

  it("genera el payload de respuesta y reconstruye el draft desde RespuestaDetalle", () => {
    const payload = buildResponderPayload(
      samplePreguntas,
      {
        p1: { valorNumerico: "5" },
        p2: { valorBooleano: true },
        p3: { opcionesIds: ["o1", "o2"] },
        p4: { valorTexto: "  Excelente servicio  " },
      },
      "  Todo conforme  ",
    )

    expect(payload).toEqual({
      comentarioGeneral: "Todo conforme",
      respuestas: [
        { preguntaId: "p1", valorNumerico: 5 },
        { preguntaId: "p2", valorBooleano: true },
        { preguntaId: "p3", opcionesIds: ["o1", "o2"] },
        { preguntaId: "p4", valorTexto: "Excelente servicio" },
      ],
    })

    const detalles: RespuestaDetalle[] = [
      {
        id: "r1",
        preguntaId: "p1",
        preguntaEnunciadoSnapshot: "Califica la puntualidad",
        tipoPreguntaSnapshot: "ESTRELLAS_1_5",
        valorTexto: null,
        valorNumerico: 5,
        valorBooleano: null,
        opcionId: null,
        opcionesIds: null,
        puntajeObtenido: 5,
      },
      {
        id: "r2",
        preguntaId: "p2",
        preguntaEnunciadoSnapshot: "¿El vehículo estaba limpio?",
        tipoPreguntaSnapshot: "SI_NO",
        valorTexto: null,
        valorNumerico: null,
        valorBooleano: true,
        opcionId: null,
        opcionesIds: null,
        puntajeObtenido: 1,
      },
    ]

    expect(mapRespuestasDetalleToDraftMap(detalles)).toEqual({
      p1: { valorNumerico: "5" },
      p2: { valorBooleano: true },
    })
  })

  it("formatea porcentajes, slugs y detecta conflictos HTTP 409", () => {
    expect(formatPorcentaje(85)).toBe("85%")
    expect(formatPorcentaje(85.44)).toBe("85.4%")
    expect(formatPorcentaje(null)).toBe("—")
    expect(slugifyOptionValue("Muy Rápido!", 1)).toBe("MUY_RAPIDO")
    expect(
      isConflictActiveCuestionarioError(
        new ApiError({ message: "Conflicto", status: 409 }),
      ),
    ).toBe(true)
    expect(
      isConflictActiveCuestionarioError(
        new ApiError({ message: "Error", status: 400 }),
      ),
    ).toBe(false)
  })
})
