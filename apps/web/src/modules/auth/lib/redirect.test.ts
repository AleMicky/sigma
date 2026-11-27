import { describe, expect, it } from "vitest"

import { routes } from "@/app/config/routes"

import { sanitizeRedirectPath } from "./redirect"

describe("sanitizeRedirectPath (REQ-SEG-106)", () => {
  it("acepta rutas internas absolutas", () => {
    expect(sanitizeRedirectPath("/seguridad/usuarios?tab=roles")).toBe(
      "/seguridad/usuarios?tab=roles",
    )
  })

  it.each([
    "//evil.example.com",
    "/\\evil.example.com",
    "/\n//evil.example.com",
    "/\t/\\\\evil.example.com",
    "/%5Cevil.com",
    "/%0A%2F%2Fevil.example.com",
    "https://evil.example.com",
  ])("rechaza el redirect externo %j", (candidate) => {
    expect(sanitizeRedirectPath(candidate)).toBe(routes.home)
  })

  it("rechaza el login como destino y valores no string o vacíos", () => {
    expect(sanitizeRedirectPath("/login?redirect=/seguridad")).toBe(routes.home)
    expect(sanitizeRedirectPath(undefined)).toBe(routes.home)
    expect(sanitizeRedirectPath(123)).toBe(routes.home)
    expect(sanitizeRedirectPath("   ")).toBe(routes.home)
  })
})
