import { ApiError, getErrorMessage } from "./errors"

export const KEYCLOAK_SYNC_ERROR_CODE = "KEYCLOAK_SYNC_ERROR"

/**
 * La API responde 422 con `code: KEYCLOAK_SYNC_ERROR` cuando Keycloak falla.
 * Se conserva el `message` del contrato y se añade contexto para no mostrar
 * una sincronización falsamente exitosa.
 */
export function getSincronizacionErrorMessage(
  error: unknown,
  recurso: string,
): string {
  if (isKeycloakSyncError(error)) {
    return `No se pudo sincronizar ${recurso} con Keycloak: ${getErrorMessage(error)}`
  }

  return getErrorMessage(error)
}

export function isKeycloakSyncError(error: unknown): boolean {
  return (
    error instanceof ApiError && error.code === KEYCLOAK_SYNC_ERROR_CODE
  )
}
