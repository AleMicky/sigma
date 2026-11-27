/** Navegación de página completa, aislada para poder verificarla en tests. */
export function navigateToExternalUrl(url: string): void {
  window.location.href = url
}
