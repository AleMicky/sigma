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
