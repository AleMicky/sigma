import { describe, expect, it } from "vitest"

import type {
  WorkflowAction,
  WorkflowTask,
  WorkflowTaskActions,
} from "../api/salida-vehicular.types"
import {
  getSalidaNextActionConfig,
  isSalidaInactive,
} from "./salida-action.utils"

function task(taskDefinitionKey: string): WorkflowTask {
  return {
    id: "task-1",
    name: taskDefinitionKey,
    taskDefinitionKey,
    processInstanceId: "process-1",
    processDefinitionId: "definition-1",
  }
}

function actions(values: string[]): WorkflowTaskActions {
  return {
    processInstanceId: "process-1",
    actions: values.map(
      (value): WorkflowAction => ({
        name: value,
        value,
        variable: "accion",
      })
    ),
  }
}

describe("getSalidaNextActionConfig", () => {
  it("no devuelve CTA cuando no hay tarea activa", () => {
    expect(
      getSalidaNextActionConfig({
        tareaActual: null,
        acciones: actions(["REGISTRAR_LLEGADA"]),
        estado: "SALIDA",
      })
    ).toBeNull()
  })

  it("no devuelve CTA cuando la tarea no tiene acciones disponibles", () => {
    expect(
      getSalidaNextActionConfig({
        tareaActual: task("registrarLlegada"),
        acciones: { processInstanceId: "process-1", actions: [] },
        estado: "SALIDA",
      })
    ).toBeNull()
  })

  it("deriva SALIDA desde la tarea activa registrarSalida", () => {
    const config = getSalidaNextActionConfig({
      tareaActual: task("registrarSalida"),
      acciones: actions(["REGISTRAR_SALIDA"]),
      estado: "PENDIENTE",
    })

    expect(config).not.toBeNull()
    expect(config?.type).toBe("SALIDA")
    expect(config?.label).toBe("Registrar Salida")
  })

  it("deriva LLEGADA desde la tarea activa registrarLlegada aunque el estado sea SALIDA", () => {
    const config = getSalidaNextActionConfig({
      tareaActual: task("registrarLlegada"),
      acciones: actions(["REGISTRAR_LLEGADA"]),
      estado: "SALIDA",
      descripcionActividad: "Visita a Planta Corani",
    })

    expect(config).not.toBeNull()
    expect(config?.type).toBe("LLEGADA")
    expect(config?.label).toBe("Registrar Llegada")
    expect(config?.title).toContain("Visita a Planta Corani")
  })

  it("no fuerza LLEGADA desde eventos de salida cuando no hay tarea activa", () => {
    expect(
      getSalidaNextActionConfig({
        tareaActual: null,
        acciones: actions(["REGISTRAR_LLEGADA"]),
        estado: "SALIDA",
        descripcionActividad: "Salida registrada",
      })
    ).toBeNull()
  })

  it("no devuelve CTA para una tarea desconocida", () => {
    expect(
      getSalidaNextActionConfig({
        tareaActual: task("aprobarSolicitud"),
        acciones: actions(["COMPLETAR"]),
        estado: "PENDIENTE",
      })
    ).toBeNull()
  })

  it("no devuelve CTA en estados terminales o cancelados", () => {
    for (const estado of [
      "LLEGADA",
      "FINALIZADA",
      "COMPLETADA",
      "CANCELADA",
      "ANULADA",
    ]) {
      expect(
        getSalidaNextActionConfig({
          tareaActual: task("registrarLlegada"),
          acciones: actions(["REGISTRAR_LLEGADA"]),
          estado,
        })
      ).toBeNull()
      expect(isSalidaInactive(estado)).toBe(true)
    }
  })
})
