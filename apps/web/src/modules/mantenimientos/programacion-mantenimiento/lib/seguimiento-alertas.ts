import type {
  ProgramacionMantenimiento,
  ProgramacionMantenimientoCriterio,
  TipoCriterioMantenimiento,
} from "../api/programacion-mantenimiento.service"

export type NivelAlertaSeguimiento = "CRITICO" | "PROXIMO" | "AL_DIA" | "INACTIVO"
export type FiltroAlertaSeguimiento = NivelAlertaSeguimiento | "TODOS"
export type FiltroCriterioSeguimiento = TipoCriterioMantenimiento | "TODOS"

export interface FilaSeguimiento {
  id: string
  programacionId: string
  programacion: ProgramacionMantenimiento
  criterioId: string
  activoCodigo: string
  activoNombre: string
  tipoActivo: string
  planCodigo: string
  planNombre: string
  tipoCriterio: TipoCriterioMantenimiento
  frecuenciaLabel: string
  lecturaActualLabel: string
  proximoUmbralLabel: string
  porcentaje: number
  margenRestanteLabel: string
  estadoAlerta: NivelAlertaSeguimiento
  criterioActivo: boolean
  programacionActiva: boolean
}

export interface FiltrosSeguimiento {
  q?: string
  filtroAlerta?: FiltroAlertaSeguimiento
  filtroCriterio?: FiltroCriterioSeguimiento
}

const MILISEGUNDOS_POR_DIA = 86_400_000

/**
 * Parsea `yyyy-MM-dd` como fecha local (America/La_Paz). `new Date("yyyy-MM-dd")`
 * lo interpreta como UTC y desplaza el día en UTC-4; la semántica canónica del
 * reporte es fecha local entera, sin horas ni milisegundos.
 */
export function toLocalDateOnly(value?: string | null): Date | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!match) return null
  const fecha = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

/** Días naturales entre dos fechas, ignorando la hora del día. */
export function diffDiasLocales(desde: Date, hasta: Date): number {
  const inicio = Date.UTC(desde.getFullYear(), desde.getMonth(), desde.getDate())
  const fin = Date.UTC(hasta.getFullYear(), hasta.getMonth(), hasta.getDate())
  return Math.round((fin - inicio) / MILISEGUNDOS_POR_DIA)
}

export function formatearFechaLocal(fecha: Date): string {
  const pad = (valor: number) => String(valor).padStart(2, "0")
  return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}`
}

/**
 * HALF_UP exacto, equivalente a `BigDecimal.setScale(0, RoundingMode.HALF_UP)`
 * de la API. Aritmética entera en lugar de `Math.round((avance / intervalo) * 100)`:
 * con `avance=23, intervalo=40` el cociente binario es `57.49999999999999` y
 * `Math.round` da 57, mientras el contrato canónico exige 58.
 */
function porcentajeHalfUp(avance: number, intervalo: number): number {
  if (
    !Number.isFinite(avance) ||
    !Number.isFinite(intervalo) ||
    intervalo <= 0
  ) {
    return 0
  }

  const avanceNormalizado = Math.max(avance, 0)
  const porcentaje = Math.floor(
    (2 * avanceNormalizado * 100 + intervalo) / (2 * intervalo),
  )
  return Math.min(Math.max(porcentaje, 0), 999)
}

interface CalculoCriterio {
  frecuenciaLabel: string
  lecturaActualLabel: string
  proximoUmbralLabel: string
  porcentaje: number
  margenRestanteLabel: string
  estadoBase: Exclude<NivelAlertaSeguimiento, "INACTIVO">
}

function calcularTiempo(
  hoy: Date,
  criterio: ProgramacionMantenimientoCriterio,
): CalculoCriterio {
  const dias = criterio.intervaloDias ?? 0
  const proximaFecha = toLocalDateOnly(criterio.proximaFecha)
  const frecuenciaLabel = `Cada ${dias} días`
  const lecturaActualLabel = formatearFechaLocal(hoy)
  const proximoUmbralLabel = proximaFecha
    ? formatearFechaLocal(proximaFecha)
    : "-"

  if (!proximaFecha || dias <= 0) {
    return {
      frecuenciaLabel,
      lecturaActualLabel,
      proximoUmbralLabel,
      porcentaje: 0,
      margenRestanteLabel: "",
      estadoBase: "AL_DIA",
    }
  }

  const fechaBase = new Date(proximaFecha.getFullYear(), proximaFecha.getMonth(), proximaFecha.getDate())
  fechaBase.setDate(fechaBase.getDate() - dias)
  const transcurridos = diffDiasLocales(fechaBase, hoy)
  const porcentaje = porcentajeHalfUp(transcurridos, dias)
  const diffDias = diffDiasLocales(hoy, proximaFecha)

  let estadoBase: Exclude<NivelAlertaSeguimiento, "INACTIVO">
  if (diffDias < 0) {
    estadoBase = "CRITICO"
  } else if (diffDias <= 15 || porcentaje >= 85) {
    estadoBase = "PROXIMO"
  } else {
    estadoBase = "AL_DIA"
  }

  return {
    frecuenciaLabel,
    lecturaActualLabel,
    proximoUmbralLabel,
    porcentaje,
    margenRestanteLabel:
      diffDias < 0
        ? `Vencido hace ${Math.abs(diffDias)} d`
        : `Faltan ${diffDias} d`,
    estadoBase,
  }
}

function calcularUso(
  criterio: ProgramacionMantenimientoCriterio,
): CalculoCriterio {
  const esKm = criterio.tipoCriterio === "KILOMETRAJE"
  const unidad = esKm ? "km" : "hrs"
  const intervalo = criterio.intervaloUso ? Number(criterio.intervaloUso) : 0
  const prox = criterio.proximoValorUso ? Number(criterio.proximoValorUso) : 0
  const actual =
    criterio.valorActualUso !== undefined && criterio.valorActualUso !== null
      ? Number(criterio.valorActualUso)
      : 0
  const base = prox - intervalo

  const avance = Math.max(actual - base, 0)
  const porcentaje = porcentajeHalfUp(avance, intervalo)

  const diff = prox - actual
  const rebasado = diff <= 0 && prox > 0

  return {
    frecuenciaLabel: `Cada ${intervalo.toLocaleString("es-BO")} ${unidad}`,
    lecturaActualLabel: `${actual.toLocaleString("es-BO")} ${unidad}`,
    proximoUmbralLabel: `${prox.toLocaleString("es-BO")} ${unidad}`,
    porcentaje,
    margenRestanteLabel: rebasado
      ? `Rebasado por ${Math.abs(diff).toLocaleString("es-BO")} ${unidad}`
      : `Faltan ${diff.toLocaleString("es-BO")} ${unidad}`,
    estadoBase: rebasado ? "CRITICO" : porcentaje >= 85 ? "PROXIMO" : "AL_DIA",
  }
}

/**
 * Desglose de programaciones en filas por criterio. Es la misma semántica que
 * implementa `ProgramacionSeguimientoExcelService` en la API (REQ-MANT-015/034).
 */
export function construirFilasSeguimiento(
  programaciones: ProgramacionMantenimiento[],
  hoy: Date = new Date(),
): FilaSeguimiento[] {
  const filas: FilaSeguimiento[] = []

  programaciones.forEach((prog) => {
    const datos = {
      activoCodigo: prog.planActivo?.activoCodigo || "N/D",
      activoNombre: prog.planActivo?.activoNombre || "N/D",
      tipoActivo: prog.planActivo?.tipoActivoNombre || "N/D",
      planCodigo: prog.planActivo?.planCodigo || "N/D",
      planNombre: prog.planActivo?.planNombre || "N/D",
      programacionActiva: Boolean(prog.activo),
    }
    const criterios = prog.criterios ?? []

    if (criterios.length === 0) {
      filas.push({
        ...datos,
        id: `${prog.id}-sin-criterios`,
        programacionId: prog.id,
        programacion: prog,
        criterioId: "sin-id",
        tipoCriterio: "TIEMPO",
        frecuenciaLabel: "Sin criterios configurados",
        lecturaActualLabel: "-",
        proximoUmbralLabel: "-",
        porcentaje: 0,
        margenRestanteLabel: "Pendiente configuración",
        estadoAlerta: "INACTIVO",
        criterioActivo: false,
      })
      return
    }

    criterios.forEach((criterio) => {
      const calculo =
        criterio.tipoCriterio === "TIEMPO"
          ? calcularTiempo(hoy, criterio)
          : calcularUso(criterio)
      const criterioActivo = Boolean(criterio.activo)
      const estadoAlerta: NivelAlertaSeguimiento =
        !datos.programacionActiva || !criterioActivo
          ? "INACTIVO"
          : calculo.estadoBase

      filas.push({
        ...datos,
        ...calculo,
        id: `${prog.id}-${criterio.id}`,
        programacionId: prog.id,
        programacion: prog,
        criterioId: criterio.id,
        tipoCriterio: criterio.tipoCriterio,
        estadoAlerta,
        criterioActivo,
      })
    })
  })

  return filas
}

/** Espejo de `cumpleFiltros` del reporte Excel del backend. */
export function filtrarFilasSeguimiento(
  filas: FilaSeguimiento[],
  filtros: FiltrosSeguimiento,
): FilaSeguimiento[] {
  const busqueda = filtros.q?.trim().toLowerCase()
  const alerta = filtros.filtroAlerta ?? "TODOS"
  const criterio = filtros.filtroCriterio ?? "TODOS"

  return filas.filter((fila) => {
    if (alerta !== "TODOS" && fila.estadoAlerta !== alerta) return false
    if (criterio !== "TODOS" && fila.tipoCriterio !== criterio) return false
    if (!busqueda) return true

    return [fila.activoCodigo, fila.activoNombre, fila.planCodigo, fila.planNombre, fila.tipoActivo]
      .some((valor) => valor.toLowerCase().includes(busqueda))
  })
}
