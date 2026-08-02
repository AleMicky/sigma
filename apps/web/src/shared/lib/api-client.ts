import { apiConfig } from "@/app/config"
import { useAuthStore } from "@/app/store/auth.store"

export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

type ApiSuccessResponse<T> = {
  success: true
  message: string
  data: T
  timestamp: string
}

type ApiErrorBody = {
  success: false
  status: number
  code?: string
  message?: string
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string): string {
  const base = apiConfig.baseUrl.replace(/\/$/, "")
  const prefix = apiConfig.apiPrefix
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${prefix}${normalizedPath}`
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options
  const headers = new Headers({
    Accept: apiConfig.headers.accept,
  })

  if (body !== undefined) {
    headers.set("Content-Type", apiConfig.headers.contentType)
  }

  if (auth) {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    apiConfig.timeout,
  )

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true })
  }

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })

    const payload = (await response.json().catch(() => null)) as
      | ApiSuccessResponse<T>
      | ApiErrorBody
      | null

    if (!response.ok) {
      const errorBody = payload as ApiErrorBody | null
      throw new ApiError(
        errorBody?.message ?? "Error en la solicitud",
        response.status,
        errorBody?.code,
      )
    }

    if (payload && "data" in payload) {
      return (payload as ApiSuccessResponse<T>).data
    }

    return payload as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La solicitud excedió el tiempo de espera", 408)
    }
    throw new ApiError("No se pudo conectar con el servidor", 0)
  } finally {
    window.clearTimeout(timeoutId)
  }
}
