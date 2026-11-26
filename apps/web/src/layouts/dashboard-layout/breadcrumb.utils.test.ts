import { describe, expect, it } from "vitest"

import { formatSegment, generateBreadcrumbs } from "./breadcrumb.utils"

describe("formatSegment", () => {
  it("usa las etiquetas legibles del diccionario", () => {
    expect(formatSegment("activos")).toBe("Activos")
    expect(formatSegment("ordenes-trabajo")).toBe("Órdenes de Trabajo")
    expect(formatSegment("gestion-vehicular")).toBe("Gestión Vehicular")
  })

  it("muestra 'Detalle' para IDs numéricos y UUID", () => {
    expect(formatSegment("42")).toBe("Detalle")
    expect(formatSegment("123e4567-e89b-12d3-a456-426614174000")).toBe(
      "Detalle",
    )
  })

  it("capitaliza segmentos desconocidos", () => {
    expect(formatSegment("reporte-personalizado")).toBe(
      "Reporte Personalizado",
    )
  })
})

describe("generateBreadcrumbs", () => {
  it("devuelve solo Inicio para la raíz", () => {
    expect(generateBreadcrumbs("/")).toEqual([
      { title: "Inicio", isCurrent: true },
    ])
    expect(generateBreadcrumbs("")).toEqual([
      { title: "Inicio", isCurrent: true },
    ])
  })

  it("construye la ruta con enlaces navegables y el último como actual", () => {
    expect(generateBreadcrumbs("/activos/catalogo")).toEqual([
      { title: "Inicio", href: "/" },
      { title: "Activos", href: "/activos", isCurrent: false },
      { title: "Catálogo", href: undefined, isCurrent: true },
    ])
  })

  it("no genera enlace para el segmento ID", () => {
    const breadcrumbs = generateBreadcrumbs(
      "/activos/catalogo/123e4567-e89b-12d3-a456-426614174000",
    )

    expect(breadcrumbs[2]).toEqual({
      title: "Catálogo",
      href: "/activos/catalogo",
      isCurrent: false,
    })
    expect(breadcrumbs[3]).toEqual({
      title: "Detalle",
      href: undefined,
      isCurrent: true,
    })
  })

  it("ignora la barra final", () => {
    expect(generateBreadcrumbs("/seguridad/usuarios/")).toEqual(
      generateBreadcrumbs("/seguridad/usuarios"),
    )
  })
})
