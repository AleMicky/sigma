import { describe, expect, it } from "vitest"

import type { MenuTreeNode } from "@/modules/seguridad/menu/api/menu.service"

import {
  collectAllowedMenuRoutes,
  isAdminUser,
  isRouteAuthorized,
} from "./use-allowed-nav-items"

function menuNode(
  overrides: Partial<MenuTreeNode> & Pick<MenuTreeNode, "id">,
): MenuTreeNode {
  return {
    menuPadreId: null,
    codigo: overrides.id,
    nombre: overrides.id,
    icono: null,
    ruta: null,
    orden: 0,
    activo: true,
    hijos: [],
    ...overrides,
  }
}

describe("isAdminUser (REQ-SEG-103)", () => {
  it("acepta solo la allowlist de roles del cliente", () => {
    expect(isAdminUser(["ADMIN"])).toBe(true)
    expect(isAdminUser(["role_admin"])).toBe(true)
    expect(isAdminUser([" ROLE-ADMIN "])).toBe(false)
    expect(isAdminUser(["ADMINISTRADOR", "SUPER_ADMIN"])).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })
})

describe("isRouteAuthorized (REQ-SEG-102)", () => {
  const cases: Array<[string, string[], boolean]> = [
    ["/gestion-vehicular/solicitudes", ["/gestion-vehicular/solicitudes"], true],
    [
      "/gestion-vehicular/solicitudes/nueva",
      ["/gestion-vehicular/solicitudes"],
      true,
    ],
    [
      "/gestion-vehicular/solicitudes/abc/editar",
      ["/gestion-vehicular/solicitudes"],
      true,
    ],
    ["/gestion-vehicular/salidas", ["/gestion-vehicular/solicitudes"], false],
    [
      "/gestion-vehicular/asignaciones",
      ["/gestion-vehicular/solicitudes"],
      false,
    ],
    ["/gestion-vehicular/vehiculos", ["/gestion-vehicular/solicitudes"], false],
    [
      "/gestion-vehicular/controles-activos",
      ["/gestion-vehicular/solicitudes"],
      false,
    ],
    ["/mantenimientos/ordenes-trabajo", ["/mantenimientos/ordenes-trabajo"], true],
    [
      "/mantenimientos/ordenes-trabajo/nuevo",
      ["/mantenimientos/ordenes-trabajo"],
      true,
    ],
    [
      "/mantenimientos/encargado",
      ["/mantenimientos/ordenes-trabajo"],
      false,
    ],
    [
      "/mantenimientos/supervisor",
      ["/mantenimientos/ordenes-trabajo"],
      false,
    ],
    [
      "/mantenimientos/solicitudes",
      ["/mantenimientos/ordenes-trabajo"],
      false,
    ],
    ["/activos/catalogo/activo-1", ["/activos/catalogo"], true],
    ["/activos/catalogo/activo-1", ["/activos/disponibilidad"], false],
    ["/cuestionarios/cuest-1/constructor", ["/cuestionarios"], true],
    ["/seguridad/usuarios", ["/gestion-vehicular/mis-viajes"], false],
    ["/", [], true],
    ["/perfil", [], true],
  ]

  it.each(cases)(
    "%s con allowedRoutes=%j ⇒ %s",
    (path, allowedRoutes, expected) => {
      expect(isRouteAuthorized(path, allowedRoutes, ["OPERARIO"])).toBe(
        expected,
      )
    },
  )

  it("una hoja dinámica no habilita la ruta contenedora", () => {
    expect(
      isRouteAuthorized(
        "/gestion-vehicular/vehiculos",
        ["/gestion-vehicular/vehiculos/:vehiculoId"],
        ["OPERARIO"],
      ),
    ).toBe(false)
  })

  it("usa menuPadreId para habilitar submódulos documentados por el árbol", () => {
    const tree = [
      menuNode({
        id: "menu-operaciones",
        ruta: "/gestion-vehicular/solicitudes",
        hijos: [
          menuNode({
            id: "menu-reporte",
            menuPadreId: "menu-operaciones",
            ruta: "/gestion-vehicular/reportes/solicitudes-vehiculares",
          }),
        ],
      }),
    ]

    expect(
      isRouteAuthorized(
        "/gestion-vehicular/reportes/solicitudes-vehiculares",
        collectAllowedMenuRoutes(tree),
        ["OPERARIO"],
        tree,
      ),
    ).toBe(true)
    expect(
      isRouteAuthorized(
        "/gestion-vehicular/reportes/bitacora",
        collectAllowedMenuRoutes(tree),
        ["OPERARIO"],
        tree,
      ),
    ).toBe(false)
  })
})
