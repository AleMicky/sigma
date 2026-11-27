import { afterEach, describe, expect, it, vi } from "vitest"

import type {
  ProgramacionMantenimiento,
  ProgramacionMantenimientoCriterio,
} from "../api/programacion-mantenimiento.service"
import {
  construirFilasSeguimiento,
  diffDiasLocales,
  filtrarFilasSeguimiento,
  toLocalDateOnly,
} from "./seguimiento-alertas"

function criterio(
  overrides: Partial<ProgramacionMantenimientoCriterio> = {},
): ProgramacionMantenimientoCriterio {
  return {
    id: "criterio-1",
    programacionMantenimientoId: "prog-1",
    tipoCriterio: "TIEMPO",
    activo: true,
    ...overrides,
  }
}

function programacion(
  criterios: ProgramacionMantenimientoCriterio[],
  activo = true,
): ProgramacionMantenimiento {
  return {
    id: "prog-1",
    planMantenimientoActivoId: "plan-activo-1",
    activo,
    criterios,
    planActivo: {
      id: "plan-activo-1",
      planMantenimientoId: "plan-1",
      activoId: "activo-1",
      activoCodigo: "ACT-001",
      activoNombre: "Excavadora 01",
      planCodigo: "PLAN-PREV-01",
      planNombre: "Preventivo pesado",
      tipoActivoNombre: "Maquinaria pesada",
    },
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("seguimiento-alertas (semántica canónica America/La_Paz)", () => {
  it("interpreta yyyy-MM-dd como fecha local entera, sin desplazamiento UTC", () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    // 23:30 local del 26/11; en UTC ya es 27/11.
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))

    const fecha = toLocalDateOnly("2026-11-26")

    expect(fecha?.getFullYear()).toBe(2026)
    expect(fecha?.getMonth()).toBe(10)
    expect(fecha?.getDate()).toBe(26)
    expect(
      diffDiasLocales(fecha!, toLocalDateOnly("2026-12-11")!),
    ).toBe(15)
  })

  it("aplica el borde 15/16 días: 15 es PROXIMO y 16 es AL_DIA", () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))

    const a15 = construirFilasSeguimiento(
      [programacion([criterio({ proximaFecha: "2026-12-11", intervaloDias: 90 })])],
      new Date(),
    )
    const a16 = construirFilasSeguimiento(
      [programacion([criterio({ proximaFecha: "2026-12-12", intervaloDias: 90 })])],
      new Date(),
    )

    expect(a15[0].estadoAlerta).toBe("PROXIMO")
    expect(a15[0].margenRestanteLabel).toBe("Faltan 15 d")
    expect(a16[0].estadoAlerta).toBe("AL_DIA")
    expect(a16[0].margenRestanteLabel).toBe("Faltan 16 d")
  })

  it("marca CRITICO una fecha vencida y respeta programaciones/criterios inactivos", () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))

    const vencida = construirFilasSeguimiento(
      [programacion([criterio({ proximaFecha: "2026-11-25", intervaloDias: 90 })])],
      new Date(),
    )
    const inactiva = construirFilasSeguimiento(
      [programacion([criterio({ proximaFecha: "2026-11-25", intervaloDias: 90 })], false)],
      new Date(),
    )
    const criterioInactivo = construirFilasSeguimiento(
      [programacion([criterio({ proximaFecha: "2026-11-25", intervaloDias: 90, activo: false })])],
      new Date(),
    )

    expect(vencida[0].estadoAlerta).toBe("CRITICO")
    expect(inactiva[0].estadoAlerta).toBe("INACTIVO")
    expect(criterioInactivo[0].estadoAlerta).toBe("INACTIVO")
  })

  it("usa el mismo umbral del 85% y rebase para kilometraje y horas de uso", () => {
    const filas = construirFilasSeguimiento(
      [
        programacion([
          criterio({
            id: "km",
            tipoCriterio: "KILOMETRAJE",
            intervaloUso: 1000,
            proximoValorUso: 10000,
            valorActualUso: 9850,
          }),
          criterio({
            id: "hrs",
            tipoCriterio: "HORAS_USO",
            intervaloUso: 500,
            proximoValorUso: 2000,
            valorActualUso: 2050,
          }),
        ]),
      ],
      new Date("2026-11-26T12:00:00Z"),
    )

    const km = filas.find((fila) => fila.criterioId === "km")!
    const hrs = filas.find((fila) => fila.criterioId === "hrs")!

    expect(km.porcentaje).toBe(85)
    expect(km.estadoAlerta).toBe("PROXIMO")
    expect(hrs.porcentaje).toBe(110)
    expect(hrs.estadoAlerta).toBe("CRITICO")
    expect(hrs.margenRestanteLabel).toContain("Rebasado por")
  })

  it("aplica HALF_UP exacto (avance=23, intervalo=40 → 58%) en los tres criterios", () => {
    vi.stubEnv("TZ", "America/La_Paz")
    vi.useFakeTimers({ toFake: ["Date"] })
    // 23:30 local del 26/11; en UTC ya es 27/11.
    vi.setSystemTime(new Date("2026-11-27T03:30:00Z"))

    const filas = construirFilasSeguimiento(
      [
        programacion([
          criterio({
            id: "tiempo",
            proximaFecha: "2026-12-13",
            intervaloDias: 40,
          }),
          criterio({
            id: "km",
            tipoCriterio: "KILOMETRAJE",
            intervaloUso: 40,
            proximoValorUso: 40,
            valorActualUso: 23,
          }),
          criterio({
            id: "hrs",
            tipoCriterio: "HORAS_USO",
            intervaloUso: 40,
            proximoValorUso: 40,
            valorActualUso: 23,
          }),
        ]),
      ],
      new Date(),
    )

    const tiempo = filas.find((fila) => fila.criterioId === "tiempo")!
    const km = filas.find((fila) => fila.criterioId === "km")!
    const hrs = filas.find((fila) => fila.criterioId === "hrs")!

    for (const fila of [tiempo, km, hrs]) {
      expect(fila.porcentaje).toBe(58)
      expect(fila.estadoAlerta).toBe("AL_DIA")
    }
    // El margen se deriva de los mismos 23/40 del ciclo, sin otro redondeo.
    expect(tiempo.margenRestanteLabel).toContain("17 d")
    expect(km.margenRestanteLabel).toContain("17 km")
    expect(hrs.margenRestanteLabel).toContain("17 hrs")
  })

  it("devuelve 0% cuando el intervalo no es positivo", () => {
    const filas = construirFilasSeguimiento(
      [
        programacion([
          criterio({
            tipoCriterio: "KILOMETRAJE",
            intervaloUso: 0,
            proximoValorUso: 40,
            valorActualUso: 23,
          }),
        ]),
      ],
      new Date("2026-11-26T12:00:00Z"),
    )

    expect(filas[0].porcentaje).toBe(0)
    expect(filas[0].estadoAlerta).toBe("AL_DIA")
  })

  it("replica los filtros del endpoint de Excel (q sobre 5 campos, alerta y criterio)", () => {
    const filas = construirFilasSeguimiento(
      [programacion([criterio({ proximaFecha: "2026-11-25", intervaloDias: 90 })])],
      new Date("2026-11-26T12:00:00Z"),
    )

    expect(
      filtrarFilasSeguimiento(filas, {
        filtroAlerta: "CRITICO",
        filtroCriterio: "TIEMPO",
      }),
    ).toHaveLength(1)
    expect(
      filtrarFilasSeguimiento(filas, { filtroAlerta: "AL_DIA" }),
    ).toHaveLength(0)
    expect(
      filtrarFilasSeguimiento(filas, { q: "PLAN-PREV-01" }),
    ).toHaveLength(1)
    expect(
      filtrarFilasSeguimiento(filas, { q: "MAQUINARIA" }),
    ).toHaveLength(1)
    expect(
      filtrarFilasSeguimiento(filas, {
        filtroAlerta: "TODOS",
        filtroCriterio: "TODOS",
        q: "   ",
      }),
    ).toHaveLength(1)
    expect(filtrarFilasSeguimiento(filas, { q: "inexistente" })).toHaveLength(0)
  })
})
