import { isApiError } from "@/shared/api"
import type { OptionsComboboxOption } from "@/shared/components/options-combobox"
import type { StatusBadgeVariant } from "@/shared/lib/status-variant"

import type {
  DisparadorCatalogo,
  EstadoAsignacionCuestionario,
  EstadoCuestionario,
  GuardarPreguntasPayload,
  PreguntaCuestionario,
  PreguntaPayload,
  ResponderAsignacionPayload,
  RespuestaDetalle,
  RespuestaItemPayload,
  TipoPregunta,
} from "../api/cuestionario.types"

export const ENTIDAD_TIPO_SOLICITUD_VEHICULAR = "SOLICITUD_VEHICULAR"

export const ESTADO_CUESTIONARIO_LABELS: Record<EstadoCuestionario, string> = {
  BORRADOR: "Borrador",
  PUBLICADO: "Publicado",
  INACTIVO: "Inactivo",
}

export const ESTADO_CUESTIONARIO_VARIANT: Record<
  EstadoCuestionario,
  StatusBadgeVariant
> = {
  BORRADOR: "neutral",
  PUBLICADO: "success",
  INACTIVO: "danger",
}

export const ESTADO_CUESTIONARIO_OPTIONS: OptionsComboboxOption[] = [
  { value: "BORRADOR", label: "Borrador" },
  { value: "PUBLICADO", label: "Publicado" },
  { value: "INACTIVO", label: "Inactivo" },
]

export const ESTADO_ASIGNACION_LABELS: Record<
  EstadoAsignacionCuestionario,
  string
> = {
  PENDIENTE: "Pendiente",
  RESPONDIDO: "Respondido",
  OMITIDO: "Omitido",
}

export const ESTADO_ASIGNACION_VARIANT: Record<
  EstadoAsignacionCuestionario,
  StatusBadgeVariant
> = {
  PENDIENTE: "warning",
  RESPONDIDO: "success",
  OMITIDO: "neutral",
}

export const TIPO_PREGUNTA_LABELS: Record<TipoPregunta, string> = {
  ESTRELLAS_1_5: "Estrellas (1 a 5)",
  ESCALA_1_5: "Escala numérica (1 a 5)",
  SI_NO: "Sí / No",
  OPCION_UNICA: "Opción única",
  OPCION_MULTIPLE: "Opción múltiple",
  TEXTO_CORTO: "Texto corto",
  TEXTO_LARGO: "Texto largo",
  NUMERICO: "Numérico",
}

export const TIPO_PREGUNTA_OPTIONS: OptionsComboboxOption[] = (
  Object.entries(TIPO_PREGUNTA_LABELS) as Array<[TipoPregunta, string]>
).map(([value, label]) => ({ value, label }))

export function tipoPreguntaRequiereOpciones(tipo: TipoPregunta): boolean {
  return tipo === "OPCION_UNICA" || tipo === "OPCION_MULTIPLE"
}

const DISPARADOR_SEP = "::"

export function buildDisparadorKey(
  item: Pick<
    DisparadorCatalogo,
    "moduloOrigen" | "entidadTipo" | "eventoDisparador"
  >,
): string {
  if (!item.moduloOrigen || !item.entidadTipo || !item.eventoDisparador) {
    return ""
  }
  return [item.moduloOrigen, item.entidadTipo, item.eventoDisparador].join(
    DISPARADOR_SEP,
  )
}

export function parseDisparadorKey(key: string): {
  moduloOrigen: string
  entidadTipo: string
  eventoDisparador: string
} | null {
  const parts = key.split(DISPARADOR_SEP)
  if (parts.length !== 3 || parts.some((part) => !part.trim())) {
    return null
  }
  return {
    moduloOrigen: parts[0],
    entidadTipo: parts[1],
    eventoDisparador: parts[2],
  }
}

const EVALUADO_TIPO_LABELS: Record<string, string> = {
  CONDUCTOR: "Conductor",
  TECNICO: "Técnico",
  ACTIVO: "Activo",
  EMPLEADO: "Empleado",
  GENERAL: "General",
}

export function formatEvaluadoTipoLabel(evaluadoTipo?: string | null): string {
  const clean = evaluadoTipo?.trim()
  if (!clean) return ""
  return (
    EVALUADO_TIPO_LABELS[clean.toUpperCase()] ??
    clean
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase())
  )
}

export function formatDisparadorOptionLabel(d: DisparadorCatalogo): string {
  const modulo = d.moduloEtiqueta || d.moduloOrigen.replaceAll("_", " ")
  const evento = d.eventoEtiqueta || d.eventoDisparador.replaceAll("_", " ")
  const entidad = d.entidadEtiqueta || d.entidadTipo.replaceAll("_", " ")
  const evaluado = formatEvaluadoTipoLabel(d.evaluadoTipoDefecto)
  const detalle = evaluado ? `${entidad} → ${evaluado}` : entidad
  return `${modulo} · ${evento} (${detalle})`
}

export function formatDisparadorLabel(
  disparadores: readonly DisparadorCatalogo[],
  moduloOrigen: string,
  entidadTipo: string,
  eventoDisparador: string,
): string {
  const match = disparadores.find(
    (d) =>
      d.moduloOrigen === moduloOrigen &&
      d.entidadTipo === entidadTipo &&
      d.eventoDisparador === eventoDisparador,
  )
  if (match) {
    const modulo = match.moduloEtiqueta || moduloOrigen.replaceAll("_", " ")
    const evento = match.eventoEtiqueta || eventoDisparador.replaceAll("_", " ")
    return `${modulo} · ${evento}`
  }
  return `${moduloOrigen} · ${eventoDisparador}`.replaceAll("_", " ")
}

export type RespuestaDraftValue = {
  valorTexto?: string
  valorNumerico?: string
  valorBooleano?: boolean | null
  opcionId?: string
  opcionesIds?: string[]
}

export type RespuestaDraftMap = Record<string, RespuestaDraftValue>

export function isPreguntaAnswered(
  pregunta: Pick<PreguntaCuestionario, "tipoPregunta">,
  value?: RespuestaDraftValue,
): boolean {
  if (!value) return false

  switch (pregunta.tipoPregunta) {
    case "ESTRELLAS_1_5":
    case "ESCALA_1_5": {
      const parsed = Number(value.valorNumerico)
      return Number.isFinite(parsed) && parsed >= 1 && parsed <= 5
    }
    case "NUMERICO": {
      const raw = (value.valorNumerico ?? "").trim()
      if (!raw) return false
      return Number.isFinite(Number(raw))
    }
    case "SI_NO":
      return typeof value.valorBooleano === "boolean"
    case "OPCION_UNICA":
      return Boolean(value.opcionId && value.opcionId.trim().length > 0)
    case "OPCION_MULTIPLE":
      return Array.isArray(value.opcionesIds) && value.opcionesIds.length > 0
    case "TEXTO_CORTO":
    case "TEXTO_LARGO":
      return Boolean(value.valorTexto && value.valorTexto.trim().length > 0)
    default:
      return false
  }
}

export function validateRespuestas(
  preguntas: readonly PreguntaCuestionario[],
  draftMap: RespuestaDraftMap,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const pregunta of preguntas) {
    if (!pregunta.activo) continue
    const value = draftMap[pregunta.id]

    if (pregunta.tipoPregunta === "NUMERICO") {
      const raw = (value?.valorNumerico ?? "").trim()
      if (raw && !Number.isFinite(Number(raw))) {
        errors[pregunta.id] = "Ingresa un número válido"
        continue
      }
    }

    if (pregunta.obligatoria && !isPreguntaAnswered(pregunta, value)) {
      errors[pregunta.id] = "Esta pregunta es obligatoria"
    }
  }

  return errors
}

export type ProgresoRespuestas = {
  totalActivas: number
  respondidas: number
  obligatoriasTotal: number
  obligatoriasRespondidas: number
  porcentaje: number
}

export function calculateProgresoRespuestas(
  preguntas: readonly PreguntaCuestionario[],
  draftMap: RespuestaDraftMap,
): ProgresoRespuestas {
  const activas = preguntas.filter((p) => p.activo)
  const totalActivas = activas.length
  let respondidas = 0
  let obligatoriasTotal = 0
  let obligatoriasRespondidas = 0

  for (const pregunta of activas) {
    const answered = isPreguntaAnswered(pregunta, draftMap[pregunta.id])
    if (answered) respondidas += 1
    if (pregunta.obligatoria) {
      obligatoriasTotal += 1
      if (answered) obligatoriasRespondidas += 1
    }
  }

  const porcentaje =
    totalActivas === 0 ? 100 : Math.round((respondidas / totalActivas) * 100)

  return {
    totalActivas,
    respondidas,
    obligatoriasTotal,
    obligatoriasRespondidas,
    porcentaje,
  }
}

export function buildResponderPayload(
  preguntas: readonly PreguntaCuestionario[],
  draftMap: RespuestaDraftMap,
  comentarioGeneral?: string,
): ResponderAsignacionPayload {
  const respuestas: RespuestaItemPayload[] = []

  for (const pregunta of preguntas) {
    if (!pregunta.activo) continue
    const value = draftMap[pregunta.id]
    if (!isPreguntaAnswered(pregunta, value)) continue

    switch (pregunta.tipoPregunta) {
      case "ESTRELLAS_1_5":
      case "ESCALA_1_5":
      case "NUMERICO":
        respuestas.push({
          preguntaId: pregunta.id,
          valorNumerico: Number(value?.valorNumerico),
        })
        break
      case "SI_NO":
        respuestas.push({
          preguntaId: pregunta.id,
          valorBooleano: Boolean(value?.valorBooleano),
        })
        break
      case "OPCION_UNICA":
        respuestas.push({
          preguntaId: pregunta.id,
          opcionId: value?.opcionId ?? null,
        })
        break
      case "OPCION_MULTIPLE":
        respuestas.push({
          preguntaId: pregunta.id,
          opcionesIds: value?.opcionesIds ?? [],
        })
        break
      case "TEXTO_CORTO":
      case "TEXTO_LARGO":
        respuestas.push({
          preguntaId: pregunta.id,
          valorTexto: value?.valorTexto?.trim() ?? null,
        })
        break
    }
  }

  const trimmedComment = comentarioGeneral?.trim()

  return {
    ...(trimmedComment ? { comentarioGeneral: trimmedComment } : {}),
    respuestas,
  }
}

export function mapRespuestasDetalleToDraftMap(
  respuestas: readonly RespuestaDetalle[],
): RespuestaDraftMap {
  const map: RespuestaDraftMap = {}

  for (const resp of respuestas) {
    map[resp.preguntaId] = {
      ...(resp.valorTexto !== null && resp.valorTexto !== undefined
        ? { valorTexto: resp.valorTexto }
        : {}),
      ...(resp.valorNumerico !== null && resp.valorNumerico !== undefined
        ? { valorNumerico: String(resp.valorNumerico) }
        : {}),
      ...(resp.valorBooleano !== null && resp.valorBooleano !== undefined
        ? { valorBooleano: resp.valorBooleano }
        : {}),
      ...(resp.opcionId ? { opcionId: resp.opcionId } : {}),
      ...(Array.isArray(resp.opcionesIds)
        ? { opcionesIds: [...resp.opcionesIds] }
        : {}),
    }
  }

  return map
}

export function formatPorcentaje(value?: number | null): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—"
  }
  const rounded = Math.round(value * 10) / 10
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`
}

export function formatNumero(value?: number | null, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—"
  }
  const fixed = value.toFixed(decimals)
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed
}

export type PreguntaOpcionDraft = {
  clientId: string
  id?: string
  etiqueta: string
  valor: string
  puntaje: string
  activo: boolean
}

export type PreguntaDraft = {
  clientId: string
  id?: string
  seccion: string
  enunciado: string
  descripcionAyuda: string
  tipoPregunta: TipoPregunta
  obligatoria: boolean
  peso: string
  activo: boolean
  opciones: PreguntaOpcionDraft[]
}

export function slugifyOptionValue(label: string, fallbackIndex: number): string {
  const normalized = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48)

  return normalized || `OPCION_${fallbackIndex}`
}

export function createEmptyOpcionDraft(
  index: number,
  clientId: string,
): PreguntaOpcionDraft {
  return {
    clientId,
    etiqueta: "",
    valor: `OPCION_${index}`,
    puntaje: String(index),
    activo: true,
  }
}

export function createEmptyPreguntaDraft(clientId: string): PreguntaDraft {
  return {
    clientId,
    seccion: "",
    enunciado: "",
    descripcionAyuda: "",
    tipoPregunta: "ESTRELLAS_1_5",
    obligatoria: true,
    peso: "1",
    activo: true,
    opciones: [],
  }
}

export function mapPreguntasToDrafts(
  preguntas: readonly PreguntaCuestionario[],
): PreguntaDraft[] {
  return [...preguntas]
    .sort((a, b) => a.orden - b.orden)
    .map((p, index) => ({
      clientId: p.id || `pregunta-${index + 1}`,
      id: p.id,
      seccion: p.seccion ?? "",
      enunciado: p.enunciado,
      descripcionAyuda: p.descripcionAyuda ?? "",
      tipoPregunta: p.tipoPregunta,
      obligatoria: p.obligatoria,
      peso: p.peso !== null && p.peso !== undefined ? String(p.peso) : "1",
      activo: p.activo,
      opciones: [...(p.opciones ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .map((opt, optIdx) => ({
          clientId: opt.id || `opt-${index + 1}-${optIdx + 1}`,
          id: opt.id,
          etiqueta: opt.etiqueta,
          valor: opt.valor,
          puntaje:
            opt.puntaje !== null && opt.puntaje !== undefined
              ? String(opt.puntaje)
              : "",
          activo: opt.activo,
        })),
    }))
}

export function mapDraftsToPreviewPreguntas(
  drafts: readonly PreguntaDraft[],
): PreguntaCuestionario[] {
  return drafts.map((d, index) => ({
    id: d.id ?? d.clientId,
    seccion: d.seccion.trim() || null,
    orden: index + 1,
    enunciado: d.enunciado.trim() || `Pregunta ${index + 1} (sin enunciado)`,
    descripcionAyuda: d.descripcionAyuda.trim() || null,
    tipoPregunta: d.tipoPregunta,
    obligatoria: d.obligatoria,
    peso: d.peso.trim() && Number.isFinite(Number(d.peso)) ? Number(d.peso) : 1,
    configJson: null,
    activo: d.activo,
    opciones: d.opciones.map((opt, optIdx) => ({
      id: opt.id ?? opt.clientId,
      orden: optIdx + 1,
      etiqueta: opt.etiqueta.trim() || `Opción ${optIdx + 1}`,
      valor: opt.valor.trim() || slugifyOptionValue(opt.etiqueta, optIdx + 1),
      puntaje:
        opt.puntaje.trim() && Number.isFinite(Number(opt.puntaje))
          ? Number(opt.puntaje)
          : null,
      activo: opt.activo,
    })),
  }))
}

export function toGuardarPreguntasPayload(
  drafts: readonly PreguntaDraft[],
): GuardarPreguntasPayload {
  const preguntas: PreguntaPayload[] = drafts.map((d, index) => {
    const requiereOpciones = tipoPreguntaRequiereOpciones(d.tipoPregunta)
    const pesoParsed =
      d.peso.trim() && Number.isFinite(Number(d.peso)) ? Number(d.peso) : 1

    return {
      ...(d.id ? { id: d.id } : {}),
      seccion: d.seccion.trim() || null,
      orden: index + 1,
      enunciado: d.enunciado.trim(),
      descripcionAyuda: d.descripcionAyuda.trim() || null,
      tipoPregunta: d.tipoPregunta,
      obligatoria: d.obligatoria,
      peso: pesoParsed,
      activo: d.activo,
      opciones: requiereOpciones
        ? d.opciones.map((opt, optIdx) => ({
            ...(opt.id ? { id: opt.id } : {}),
            orden: optIdx + 1,
            etiqueta: opt.etiqueta.trim(),
            valor:
              opt.valor.trim() || slugifyOptionValue(opt.etiqueta, optIdx + 1),
            puntaje:
              opt.puntaje.trim() && Number.isFinite(Number(opt.puntaje))
                ? Number(opt.puntaje)
                : null,
            activo: opt.activo,
          }))
        : [],
    }
  })

  return { preguntas }
}

export function isConflictActiveCuestionarioError(error: unknown): boolean {
  return isApiError(error) && error.status === 409
}
