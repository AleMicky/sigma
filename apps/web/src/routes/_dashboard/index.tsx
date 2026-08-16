import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, ChevronRight } from "lucide-react"

import { appConfig, flattenNavChildren, navItems, routes } from "@/app/config"
import { useAuthStore } from "@/app/store/auth.store"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

const moduleDescriptions: Record<string, string> = {
  Activos: "Inventario, tipos y categorías de activos.",
  Parámetros: "Catálogos, tipos de dato y configuración.",
}

function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

export const Route = createFileRoute("/_dashboard/")({
  component: HomePage,
})

function HomePage() {
  const user = useAuthStore((state) => state.user)
  const displayName = user?.name?.split(/\s+/)[0] || user?.username || "usuario"
  const menuModules = navItems.filter((item) => item.to !== routes.home)

  return (
    <PageShell size="xl" layout="scroll" padding="default">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {appConfig.shortName}
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {getGreeting()}, {displayName}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            {appConfig.description}. Elige un módulo para comenzar.
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          render={<Link to={routes.activos.root} />}
          className="w-fit"
        >
          Ir a activos
          <ArrowRight data-icon="inline-end" />
        </Button>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-medium tracking-tight">
            Menú principal
          </h2>
          <p className="text-sm text-muted-foreground">
            Accesos rápidos a los módulos disponibles.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {menuModules.map((module) => {
            const links = module.children?.length
              ? flattenNavChildren(module.children)
              : [{ title: module.title, to: module.to, icon: module.icon }]

            return (
              <Card
                key={module.title}
                className="transition-colors hover:bg-muted/30"
              >
                <CardHeader className="border-b">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                      <module.icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{module.title}</CardTitle>
                      <CardDescription>
                        {moduleDescriptions[module.title] ??
                          "Abrir este módulo del sistema."}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="flex flex-col gap-0.5">
                    {links.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to as any}
                          className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
                        >
                          <link.icon className="size-4 text-muted-foreground" />
                          <span className="flex-1">{link.title}</span>
                          <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </PageShell>
  )
}
