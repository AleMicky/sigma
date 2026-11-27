import { describe, expect, it } from "vitest"

import type { Rol } from "../api/rol.service"

import { getFriendlyRoleName } from "./rol.utils"

function rol(codigo: string, nombre = codigo): Rol {
  return {
    id: `rol-${codigo}`,
    keycloakRoleId: `keycloak-${codigo}`,
    codigo,
    nombre,
    descripcion: "",
    activo: true,
  }
}

describe("getFriendlyRoleName (REQ-SEG-110)", () => {
  it.each([
    ["ADMIN", "Administrador"],
    ["ENCARGADO_MOVILIDADES", "Encargado de Movilidades"],
    ["CONDUCTOR", "Conductor"],
    ["SOLICITANTE_MOVILIDAD", "Solicitante de Movilidad"],
    ["ENCARGADO", "Encargado"],
    ["SUPERVISOR", "Supervisor"],
    ["SOLICITANTE", "Solicitante"],
  ])("usa la etiqueta del rol real de V159 %s", (codigo, esperado) => {
    expect(getFriendlyRoleName(rol(codigo))).toBe(esperado)
  })

  it("reconoce el prefijo de Keycloak sin inventar un rol nuevo", () => {
    expect(getFriendlyRoleName(rol("ROLE_ADMIN", "admin"))).toBe("Administrador")
  })

  it("usa un fallback seguro para códigos desconocidos", () => {
    expect(getFriendlyRoleName(rol("ROL_INVENTADO"))).toBe("Inventado")
    expect(getFriendlyRoleName(rol("OPERADOR"))).toBe("Operador")
    expect(getFriendlyRoleName(null)).toBe("")
  })

  it("no define el rol PORTERO que no existe en V159", () => {
    expect(getFriendlyRoleName(rol("PORTERO"))).toBe("Portero")
  })
})
