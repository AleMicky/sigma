import { describe, expect, it } from "vitest"

import { defaultSolicitudValues } from "../schemas/solicitud.schema"
import { buildSolicitudPayload } from "./use-solicitud-form"

describe("buildSolicitudPayload (contrato SolicitudMantenimientoRequest)", () => {
  it("no incluye fechaSolicitud en el cuerpo enviado a la API", () => {
    const payload = buildSolicitudPayload({
      ...defaultSolicitudValues,
      titulo: "  Fallo hidráulico  ",
      descripcion: "  Revisar la bomba principal  ",
      tipoFallas: ["Fuga"],
      activoId: "  activo-1  ",
      tipoMantenimientoId: "  tipo-1  ",
      prioridadId: "  prioridad-1  ",
      solicitanteId: "  empleado-1  ",
      fechaSolicitud: "2026-11-27T08:30",
    })

    expect(payload).not.toHaveProperty("fechaSolicitud")
    expect(Object.keys(payload).sort()).toEqual(
      [
        "activoId",
        "descripcion",
        "prioridadId",
        "solicitanteId",
        "tipoFallas",
        "tipoMantenimientoId",
        "titulo",
      ].sort(),
    )
    expect(payload).toEqual({
      titulo: "Fallo hidráulico",
      descripcion: "Revisar la bomba principal",
      tipoFallas: ["Fuga"],
      activoId: "activo-1",
      tipoMantenimientoId: "tipo-1",
      prioridadId: "prioridad-1",
      solicitanteId: "empleado-1",
    })
  })

  it("envía tipoFallas como null cuando no hay fallas seleccionadas", () => {
    const payload = buildSolicitudPayload(defaultSolicitudValues)

    expect(payload).not.toHaveProperty("fechaSolicitud")
    expect(payload.tipoFallas).toBeNull()
  })
})
