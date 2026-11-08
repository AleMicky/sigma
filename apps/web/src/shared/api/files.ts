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
 * Abre un archivo autenticado en una nueva pestaña (PDFs, imágenes) o lo
 * descarga con su nombre y extensión originales si es un documento (Excel, Word, etc.).
 */
export async function openOrDownloadProtectedFile(
  path: string,
  fileName: string,
  mimeType?: string | null,
): Promise<"viewed" | "downloaded"> {
  const canView = isBrowserViewable(fileName, mimeType)
  // Abrir ventana previa únicamente si se va a visualizar en el navegador para no dejar pestaña vacía
  const newWindow = canView ? window.open("", "_blank") : null

  try {
    const blob = await fetchAuthenticatedBlob(path)
    const objectUrl = URL.createObjectURL(blob)

    if (canView) {
      if (newWindow) {
        newWindow.location.href = objectUrl
      } else {
        window.open(objectUrl, "_blank")
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
      return "viewed"
    }

    const a = document.createElement("a")
    a.href = objectUrl
    a.download = fileName || "archivo"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000)
    return "downloaded"
  } catch (error) {
    newWindow?.close()
    throw error
  }
}
