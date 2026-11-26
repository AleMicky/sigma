import { beforeAll, describe, expect, it, vi } from "vitest"

import { http } from "@/shared/api/http"

import {
  downloadProtectedFile,
  fetchAuthenticatedBlob,
  isBrowserViewable,
  openOrDownloadProtectedFile,
  openPdfInNewTab,
  openProtectedFile,
  toApiRelativePath,
  uploadImage,
} from "./files"

vi.mock("@/shared/api/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const httpMock = vi.mocked(http)

describe("toApiRelativePath", () => {
  it("quita el prefijo /api/v1 y garantiza la barra inicial", () => {
    expect(toApiRelativePath("/api/v1/files/activos/1.pdf")).toBe(
      "/files/activos/1.pdf",
    )
    expect(toApiRelativePath("/api/v1/files")).toBe("/files")
    expect(toApiRelativePath("files/activos/1.pdf")).toBe(
      "/files/activos/1.pdf",
    )
  })

  it("respetapaths ya relativos y valores vacíos", () => {
    expect(toApiRelativePath("/files/activos/1.pdf")).toBe(
      "/files/activos/1.pdf",
    )
    expect(toApiRelativePath("  ")).toBe("")
  })
})

describe("fetchAuthenticatedBlob y uploadImage", () => {
  it("pide el blob con la ruta relativa y headers correctos", async () => {
    const blob = new Blob(["contenido"], { type: "application/pdf" })
    httpMock.get.mockResolvedValueOnce(blob)

    await expect(
      fetchAuthenticatedBlob("/api/v1/files/reporte.pdf"),
    ).resolves.toBe(blob)
    expect(httpMock.get).toHaveBeenCalledWith("/files/reporte.pdf", {
      responseType: "blob",
      headers: { Accept: "*/*" },
    })
  })

  it("envía el archivo en FormData", async () => {
    httpMock.post.mockResolvedValueOnce({ id: "img-1" })
    const file = new File(["img"], "foto.png", { type: "image/png" })

    await expect(
      uploadImage("/api/v1/activos/1/imagen", file),
    ).resolves.toEqual({ id: "img-1" })

    const [, formData] = httpMock.post.mock.calls[0] ?? []
    expect(httpMock.post).toHaveBeenCalledWith(
      "/activos/1/imagen",
      expect.any(FormData),
    )
    expect((formData as FormData).get("file")).toBe(file)
  })
})

describe("isBrowserViewable", () => {
  it("reconoce PDF, imágenes y texto por mime o extensión", () => {
    expect(isBrowserViewable("archivo.bin", "application/pdf")).toBe(true)
    expect(isBrowserViewable("archivo.bin", "image/png")).toBe(true)
    expect(isBrowserViewable("notas.TXT")).toBe(true)
    expect(isBrowserViewable("foto.WEBP")).toBe(true)
  })

  it("marca documentos de Office para descarga", () => {
    expect(isBrowserViewable("reporte.xlsx", "application/vnd.ms-excel")).toBe(
      false,
    )
    expect(isBrowserViewable("reporte.docx")).toBe(false)
  })
})

describe("openPdfInNewTab", () => {
  const createObjectURL = vi.fn(() => "blob:reporte")
  const revokeObjectURL = vi.fn()

  beforeAll(() => {
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      configurable: true,
    })
  })

  it("abre la pestaña antes de la petición y revoca el ObjectURL", async () => {
    vi.useFakeTimers()
    httpMock.get.mockResolvedValueOnce(new Blob(["pdf"]))
    const fakeWindow = {
      opener: window,
      location: { href: "" },
      close: vi.fn(),
    } as unknown as Window
    const openSpy = vi.spyOn(window, "open").mockReturnValue(fakeWindow)

    await openPdfInNewTab("/api/v1/reportes/1", "reporte.pdf")

    expect(openSpy).toHaveBeenCalledWith("", "_blank")
    expect(httpMock.get).toHaveBeenCalledWith("/reportes/1", {
      params: undefined,
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    })
    expect(fakeWindow.opener).toBeNull()
    expect(fakeWindow.location.href).toBe("blob:reporte")
    expect(revokeObjectURL).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:reporte")
    vi.useRealTimers()
  })

  it("descarga el PDF si el popup está bloqueado", async () => {
    vi.useFakeTimers()
    httpMock.get.mockResolvedValueOnce(new Blob(["pdf"]))
    vi.spyOn(window, "open").mockReturnValue(null)
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    await openPdfInNewTab("/reportes/1", "reporte.pdf")

    expect(clickSpy).toHaveBeenCalledOnce()
    expect(document.querySelector("a[download='reporte.pdf']")).toBeNull()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:reporte")
    document.querySelectorAll("a").forEach((anchor) => anchor.remove())
    vi.useRealTimers()
  })

  it("cierra la pestaña si falla la petición", async () => {
    httpMock.get.mockRejectedValueOnce(new Error("boom"))
    const fakeWindow = { close: vi.fn() } as unknown as Window
    vi.spyOn(window, "open").mockReturnValue(fakeWindow)

    await expect(openPdfInNewTab("/reportes/1", "r.pdf")).rejects.toThrow(
      "boom",
    )
    expect(fakeWindow.close).toHaveBeenCalledOnce()
  })
})

describe("visor y descarga de archivos protegidos", () => {
  const createObjectURL = vi.fn(() => "blob:documento")
  const revokeObjectURL = vi.fn()

  beforeAll(() => {
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      configurable: true,
    })
  })

  it("abre la pestaña antes del fetch y revoca el ObjectURL", async () => {
    vi.useFakeTimers()
    revokeObjectURL.mockClear()
    httpMock.get.mockResolvedValueOnce(new Blob(["pdf"]))
    const fakeWindow = {
      opener: window,
      location: { href: "" },
      close: vi.fn(),
    } as unknown as Window
    const openSpy = vi.spyOn(window, "open").mockReturnValue(fakeWindow)

    await openProtectedFile("/api/v1/files/activos/1.pdf", "acta.pdf")

    expect(openSpy).toHaveBeenCalledWith("", "_blank")
    expect(httpMock.get).toHaveBeenCalledWith("/files/activos/1.pdf", {
      responseType: "blob",
      headers: { Accept: "*/*" },
    })
    expect(fakeWindow.opener).toBeNull()
    expect(fakeWindow.location.href).toBe("blob:documento")
    await vi.advanceTimersByTimeAsync(60_000)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:documento")
    vi.useRealTimers()
  })

  it("descarga con el nombre original si el popup está bloqueado", async () => {
    vi.useFakeTimers()
    revokeObjectURL.mockClear()
    httpMock.get.mockResolvedValueOnce(new Blob(["xlsx"]))
    vi.spyOn(window, "open").mockReturnValue(null)
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    await openProtectedFile("/files/planilla.xlsx", "planilla.xlsx")

    expect(clickSpy).toHaveBeenCalledOnce()
    expect(document.querySelector("a[download='planilla.xlsx']")).toBeNull()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:documento")
    document.querySelectorAll("a").forEach((anchor) => anchor.remove())
    vi.useRealTimers()
  })

  it("cierra la pestaña abierta si el fetch falla", async () => {
    httpMock.get.mockRejectedValueOnce(new Error("red caída"))
    const fakeWindow = { close: vi.fn() } as unknown as Window
    vi.spyOn(window, "open").mockReturnValue(fakeWindow)

    await expect(
      openProtectedFile("/files/acta.pdf", "acta.pdf"),
    ).rejects.toThrow("red caída")
    expect(fakeWindow.close).toHaveBeenCalledOnce()
  })

  it("downloadProtectedFile descarga y limpia el enlace temporal", async () => {
    vi.useFakeTimers()
    revokeObjectURL.mockClear()
    httpMock.get.mockResolvedValueOnce(new Blob(["docx"]))
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    await downloadProtectedFile("/files/contrato.docx", "contrato.docx")

    expect(clickSpy).toHaveBeenCalledOnce()
    expect(revokeObjectURL).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:documento")
    vi.useRealTimers()
  })

  it("openOrDownloadProtectedFile elige descarga para documentos Office", async () => {
    vi.useFakeTimers()
    httpMock.get.mockResolvedValueOnce(new Blob(["xlsx"]))
    const openSpy = vi.spyOn(window, "open")
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    await expect(
      openOrDownloadProtectedFile(
        "/files/planilla.xlsx",
        "planilla.xlsx",
        "application/vnd.ms-excel",
      ),
    ).resolves.toBe("downloaded")

    expect(openSpy).not.toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalledOnce()
    await vi.advanceTimersByTimeAsync(10_000)
    document.querySelectorAll("a").forEach((anchor) => anchor.remove())
    vi.useRealTimers()
  })
})
