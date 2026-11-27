/** Estado compartido del flujo 401 (deduplicación de refresh y de redirección). */
export const authRedirectState: {
  isRedirecting: boolean
  refreshPromise: Promise<string> | null
  /** Intento de navegación en curso: se limpia al terminar, incluso si falla. */
  redirectPromise: Promise<void> | null
} = {
  isRedirecting: false,
  refreshPromise: null,
  redirectPromise: null,
}
