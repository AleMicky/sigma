import { apiConfig } from "@/app/config"

import { http } from "./http"

/**
 * Convierte una URL pública del API (`/api/v1/files/...`)
 * a un path relativo al baseURL de axios (`/files/...`).
 */
export function toApiRelativePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return trimmed

  const prefix = apiConfig.apiPrefix
  if (trimmed.startsWith(prefix)) {
    const relative = trimmed.slice(prefix.length)
    return relative.startsWith("/") ? relative : `/${relative}`
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

export async function fetchAuthenticatedBlob(
  path: string,
): Promise<Blob> {
  return http.get<Blob>(toApiRelativePath(path), {
    responseType: "blob",
    headers: {
      Accept: "*/*",
    },
  })
}

export async function uploadImage<TResponse>(
  path: string,
  file: File,
): Promise<TResponse> {
  const formData = new FormData()
  formData.append("file", file)
  return http.post<TResponse>(toApiRelativePath(path), formData)
}

/**
 * Abre un reporte PDF autenticado en una pestaña nueva.
 *
 * La pestaña se crea **antes** de la petición para conservar el gesto del
 * usuario y evitar que el bloqueador de pop-ups la descarte. Si la petición
 * falla se cierra; si el popup está bloqueado se deja una descarga como
 * respaldo. El `ObjectURL` siempre se revoca después de usarlo.
 */
export async function openPdfInNewTab(
  path: string,
  fileName: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<void> {
  const newWindow = window.open("", "_blank")

  try {
    const blob = await http.get<Blob>(toApiRelativePath(path), {
      params,
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    })
    const objectUrl = URL.createObjectURL(blob)

    if (newWindow) {
      newWindow.opener = null
      newWindow.location.href = objectUrl
      // Margen suficiente para que el navegador termine de leer el blob.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
      return
    }

    // Popup bloqueado: no perder el reporte, ofrecerlo como descarga.
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = fileName || "reporte.pdf"
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
  } catch (error) {
    newWindow?.close()
    throw error
  }
}

/**
 * Determina si el archivo puede previsualizarse nativamente en una pestaña
 * del navegador (PDF, imágenes, texto) o si debe descargarse (Excel, Word, etc.).
 */
export function isBrowserViewable(
  fileName: string,
  mimeType?: string | null,
): boolean {
  if (
    mimeType?.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType?.startsWith("text/")
  ) {
    return true
  }
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  return ["pdf", "jpg", "jpeg", "png", "webp", "gif", "svg", "txt"].includes(ext)
}

/**
 * Abre un archivo autenticado en pestaña nueva. La ventana se crea antes de
 * la petición para conservar el gesto del usuario; si el popup está bloqueado
 * se ofrece la descarga como respaldo.
 */
export async function openProtectedFile(
  path: string,
  fileName: string,
): Promise<void> {
  const newWindow = window.open("", "_blank")

  try {
    const blob = await fetchAuthenticatedBlob(path)
    const objectUrl = URL.createObjectURL(blob)

    if (newWindow) {
      newWindow.opener = null
      newWindow.location.href = objectUrl
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
      return
    }

    const link = document.createElement("a")
    link.href = objectUrl
    link.download = fileName || "archivo"
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
  } catch (error) {
    newWindow?.close()
    throw error
  }
}

/** Descarga un archivo autenticado y revoca el ObjectURL con un margen seguro. */
export async function downloadProtectedFile(
  path: string,
  fileName: string,
): Promise<void> {
  const blob = await fetchAuthenticatedBlob(path)
  const objectUrl = URL.createObjectURL(blob)

  try {
    const link = document.createElement("a")
    link.href = objectUrl
    link.download = fileName || "archivo"
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
  }
}

/**
 * Abre un archivo autenticado en una nueva pestaña (PDFs, imágenes) o lo
 * descarga con su nombre y extensión originales si es un documento (Excel, Word, etc.).
 */
export async function openOrDownloadProtectedFile(
  path: string,
  fileName: string,
  mimeType?: string | null,
): Promise<"viewed" | "downloaded"> {
  if (isBrowserViewable(fileName, mimeType)) {
    await openProtectedFile(path, fileName)
    return "viewed"
  }

  await downloadProtectedFile(path, fileName)
  return "downloaded"
}
