import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { authQueries } from "@/modules/auth/api/auth.queries"
import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar"
import { PageShell } from "@/shared/components/page-shell"

export const Route = createFileRoute("/_dashboard/perfil")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(authQueries.me()),
  component: PerfilPage,
})

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function PerfilPage() {
  const { data: user } = useSuspenseQuery(authQueries.me())
  const displayName = user.name || user.username
  const initials = getInitials(displayName)

  const fields = [
    { label: "Usuario Keycloak", value: user.username },
    { label: "Nombre", value: user.name || "—" },
    { label: "Correo", value: user.email || "—" },
    { label: "ID", value: user.id },
  ] as const

  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Mi perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Datos de tu cuenta en Keycloak.
        </p>
      </div>

      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 rounded-full">
            <AvatarFallback className="rounded-full bg-muted text-base font-medium">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-lg font-medium">{displayName}</span>
            <span className="truncate text-sm text-muted-foreground">
              @{user.username}
            </span>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col gap-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {field.label}
              </dt>
              <dd className="truncate text-sm font-medium">{field.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Roles
          </span>
          {user.roles.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <li
                  key={role}
                  className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium"
                >
                  {role}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin roles asignados</p>
          )}
        </div>
      </section>
    </PageShell>
  )
}
