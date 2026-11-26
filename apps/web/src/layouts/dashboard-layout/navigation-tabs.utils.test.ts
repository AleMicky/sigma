import { beforeEach, describe, expect, it } from "vitest"

import type { NavSection } from "@/shared/types/nav.types"

import {
  DEFAULT_HOME_TAB,
  MAX_TABS,
  STORAGE_KEY,
  computeOtherTabs,
  findNavNode,
  getNextTabPathAfterClose,
  getStorageKey,
  isFormOrTransientPath,
  loadInitialTabs,
  resolveTabInfo,
  saveTabsToStorage,
  syncTabsOnPathChange,
  trimTabsToLimit,
} from "./navigation-tabs.utils"

const navItems: NavSection[] = [
  {
    id: "activos",
    title: "Activos",
    to: "/activos",
    color: "#10B981",
    children: [
      { id: "catalogo", title: "Catálogo", to: "/activos/catalogo" },
    ],
  },
]

const transientTab = {
  id: "/activos/registro-activo/nuevo",
  pathname: "/activos/registro-activo/nuevo",
  title: "Nuevo activo",
}

describe("getStorageKey", () => {
  it("aísla las pestañas por usuario", () => {
    expect(getStorageKey()).toBe(STORAGE_KEY)
    expect(getStorageKey(null)).toBe(STORAGE_KEY)
    expect(getStorageKey("user-1")).toBe(`${STORAGE_KEY}_user-1`)
  })
})

describe("resolveTabInfo", () => {
  it("resuelve Inicio con color por defecto", () => {
    expect(resolveTabInfo("/", navItems)).toEqual({
      title: "Inicio",
      color: "#3B82F6",
    })
  })

  it("hereda el color del menú en rutas anidadas", () => {
    expect(findNavNode(navItems, "/activos/catalogo")).toEqual({
      title: "Catálogo",
      color: "#10B981",
    })
    expect(resolveTabInfo("/activos/catalogo", navItems)).toEqual({
      title: "Catálogo",
      color: "#10B981",
    })
  })

  it("usa el diccionario y luego el último segmento como fallback", () => {
    expect(resolveTabInfo("/activos")).toEqual({
      title: "Activos",
      color: null,
    })
    expect(resolveTabInfo("/reporte-personalizado")).toEqual({
      title: "Reporte Personalizado",
      color: null,
    })
  })
})

describe("isFormOrTransientPath", () => {
  it("detecta formularios y rutas con ID", () => {
    expect(isFormOrTransientPath("/activos/registro-activo/nuevo")).toBe(true)
    expect(isFormOrTransientPath("/activos/registro-activo/editar")).toBe(true)
    expect(
      isFormOrTransientPath(
        "/activos/registro-activo/123e4567-e89b-12d3-a456-426614174000",
      ),
    ).toBe(true)
  })

  it("respeta listados y la raíz", () => {
    expect(isFormOrTransientPath("/")).toBe(false)
    expect(isFormOrTransientPath("/activos/catalogo")).toBe(false)
    // REQ-BIZ-024: el listado de registro de activos no es un formulario.
    expect(isFormOrTransientPath("/activos/registro-activo")).toBe(false)
  })
})

describe("persistencia en sessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("cae a Inicio cuando no hay datos o el JSON es inválido", () => {
    expect(loadInitialTabs()).toEqual([DEFAULT_HOME_TAB])

    sessionStorage.setItem(STORAGE_KEY, "{no es json")
    expect(loadInitialTabs()).toEqual([DEFAULT_HOME_TAB])
  })

  it("descarta pestañas transitorias guardadas", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        DEFAULT_HOME_TAB,
        transientTab,
        { id: "/activos", pathname: "/activos", title: "Activos" },
      ]),
    )

    expect(loadInitialTabs().map((tab) => tab.pathname)).toEqual([
      "/",
      "/activos",
    ])
  })

  it("conserva el listado de registro de activo y descarta solo su alta", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        DEFAULT_HOME_TAB,
        {
          id: "/activos/registro-activo",
          pathname: "/activos/registro-activo",
          title: "Registro de Activos",
        },
        transientTab,
      ]),
    )

    expect(loadInitialTabs().map((tab) => tab.pathname)).toEqual([
      "/",
      "/activos/registro-activo",
    ])
  })

  it("guarda y recupera pestañas con la clave del usuario", () => {
    const tabs = [
      DEFAULT_HOME_TAB,
      { id: "/activos", pathname: "/activos", title: "Activos" },
    ]

    saveTabsToStorage("user-1", tabs)

    expect(sessionStorage.getItem(getStorageKey("user-1"))).toBe(
      JSON.stringify(tabs),
    )
    expect(loadInitialTabs("user-1").map((tab) => tab.pathname)).toEqual([
      "/",
      "/activos",
    ])
  })
})

describe("trimTabsToLimit", () => {
  it("conserva Inicio y las pestañas más recientes", () => {
    const tabs = [
      DEFAULT_HOME_TAB,
      ...Array.from({ length: 12 }, (_, index) => ({
        id: `/p${index}`,
        pathname: `/p${index}`,
        title: `P${index}`,
      })),
    ]

    const trimmed = trimTabsToLimit(tabs)

    expect(trimmed).toHaveLength(MAX_TABS)
    expect(trimmed[0].pathname).toBe("/")
    expect(trimmed.at(-1)?.pathname).toBe("/p11")
  })
})

describe("syncTabsOnPathChange", () => {
  it("agrega la ruta con título y color del menú", () => {
    const result = syncTabsOnPathChange([DEFAULT_HOME_TAB], "/activos", navItems)

    expect(result.map((tab) => tab.pathname)).toEqual(["/", "/activos"])
    expect(result[1]).toMatchObject({ title: "Activos", color: "#10B981" })
  })

  it("registra el listado de registro de activo pero no su formulario de alta", () => {
    const withList = syncTabsOnPathChange(
      [DEFAULT_HOME_TAB],
      "/activos/registro-activo",
      navItems,
    )

    expect(withList.map((tab) => tab.pathname)).toEqual([
      "/",
      "/activos/registro-activo",
    ])
    expect(withList[1].title).toBe("Registro de Activos")

    expect(
      syncTabsOnPathChange(
        withList,
        "/activos/registro-activo/nuevo",
        navItems,
      ).map((tab) => tab.pathname),
    ).toEqual(["/", "/activos/registro-activo"])
  })

  it("ignora rutas de autenticación", () => {
    expect(syncTabsOnPathChange([DEFAULT_HOME_TAB], "/login")).toEqual([
      DEFAULT_HOME_TAB,
    ])
    expect(
      syncTabsOnPathChange([DEFAULT_HOME_TAB], "/auth/callback"),
    ).toEqual([DEFAULT_HOME_TAB])
  })

  it("limpia pestañas transitorias al navegar", () => {
    const tabs = [DEFAULT_HOME_TAB, transientTab]

    expect(
      syncTabsOnPathChange(tabs, "/activos/catalogo", navItems).map(
        (tab) => tab.pathname,
      ),
    ).toEqual(["/", "/activos/catalogo"])

    expect(
      syncTabsOnPathChange(tabs, "/activos/registro-activo/nuevo").map(
        (tab) => tab.pathname,
      ),
    ).toEqual(["/"])
  })
})

describe("computeOtherTabs", () => {
  it("devuelve Inicio y la pestaña actual sin duplicarlos", () => {
    const tabs = [
      DEFAULT_HOME_TAB,
      { id: "/activos", pathname: "/activos", title: "Activos" },
      { id: "/activos/catalogo", pathname: "/activos/catalogo", title: "Catálogo" },
    ]

    expect(
      computeOtherTabs(tabs, "/activos", navItems).map((tab) => tab.pathname),
    ).toEqual(["/", "/activos"])
    expect(
      computeOtherTabs(tabs, "/", navItems).map((tab) => tab.pathname),
    ).toEqual(["/"])
  })
})

describe("getNextTabPathAfterClose", () => {
  it("selecciona la pestaña anterior o la primera disponible", () => {
    const tabs = [
      DEFAULT_HOME_TAB,
      { id: "/activos", pathname: "/activos", title: "Activos" },
      { id: "/activos/catalogo", pathname: "/activos/catalogo", title: "Catálogo" },
    ]

    expect(
      getNextTabPathAfterClose(tabs, [tabs[0], tabs[2]], tabs[1].id),
    ).toBe("/")
    expect(
      getNextTabPathAfterClose(tabs, [tabs[0], tabs[1]], tabs[2].id),
    ).toBe("/activos")
  })
})
