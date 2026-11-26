import { routes } from "@/app/config/routes"

export function sanitizeRedirectPath(redirectParam?: unknown): string {
  if (typeof redirectParam !== "string") {
    return routes.home
  }

  const trimmed = redirectParam.trim()

  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.startsWith(routes.login)
  ) {
    return routes.home
  }

  return trimmed
}
