import type { QueryClient } from "@tanstack/react-query"

export interface AuthUser {
  id: string
  username: string
  name: string
  email: string
  roles: string[]
}

export interface AuthContext {
  user: AuthUser | null
  isAuthenticated: boolean
}

export interface RouterContext {
  queryClient: QueryClient
  auth: AuthContext
}
