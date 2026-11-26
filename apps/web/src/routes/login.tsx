import { createFileRoute, redirect } from "@tanstack/react-router"

import { sanitizeRedirectPath } from "@/modules/auth/lib/redirect"
import { LoginPage } from "@/modules/auth/pages/LoginPage"

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.trim().length > 0
        ? search.redirect
        : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ href: sanitizeRedirectPath(search.redirect) })
    }
  },
  component: LoginPage,
})
