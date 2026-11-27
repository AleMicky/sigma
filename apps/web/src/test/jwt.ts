/** JWT de prueba con un `exp` válido durante `validForSeconds`. */
export function jwtForTests(validForSeconds: number): string {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + validForSeconds }),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
  return `header.${payload}.signature`
}
