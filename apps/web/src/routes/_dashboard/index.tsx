import { useState, useMemo } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ArrowRight,
  Boxes,
  Building2,
  Calendar,
  ChevronRight,
  FileSearch,
  FileText,
  LayoutGrid,
  Search,
  Users,
  Wrench,
  X,
} from "lucide-react"

import { appConfig, flattenNavChildren, navItems, routes } from "@/app/config"
import { useAuthStore } from "@/app/store/auth.store"
import { PageShell } from "@/shared/components/page-shell"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

const moduleMeta: Record<
  string,
  {
    description: string
    color: string
    badgeColor: string
    gradient: string
    borderHover: string
  }
> = {
  Organización: {
    description:
      "Gestión de personal, áreas organizacionales, cargos, responsabilidades y grupos aprobadores.",
    color: "text-blue-500 dark:text-blue-400 bg-blue-500/10",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    borderHover: "hover:border-blue-500/40",
  },
  Activos: {
    description:
      "Registro general de activos fijos, catálogo técnico, reportes GRS y configuraciones.",
    color: "text-amber-500 dark:text-amber-400 bg-amber-500/10",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    borderHover: "hover:border-amber-500/40",
  },
  Inventarios: {
    description:
      "Control de insumos de almacén, tipos y categorías para abastecimiento operativo.",
    color: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10",
    badgeColor:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderHover: "hover:border-emerald-500/40",
  },
  Mantenimientos: {
    description:
      "Flujo integral de solicitudes, aprobaciones, encargados, supervisores y checklists de control.",
    color: "text-orange-500 dark:text-orange-400 bg-orange-500/10",
    badgeColor:
      "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    borderHover: "hover:border-orange-500/40",
  },
  Parámetros: {
    description:
      "Catálogos generales del sistema, tipos de datos, ubicaciones y unidades de medida.",
    color: "text-violet-500 dark:text-violet-400 bg-violet-500/10",
    badgeColor:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
    borderHover: "hover:border-violet-500/40",
  },
}

function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

function formatCurrentDate() {
  const now = new Date()
  return new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now)
}

export const Route = createFileRoute("/_dashboard/")({
  component: HomePage,
})

function HomePage() {
  const user = useAuthStore((state) => state.user)
  const displayName =
    user?.name?.split(/\s+/)[0] || user?.username || "Usuario"
  const [searchQuery, setSearchQuery] = useState("")

  const menuModules = useMemo(
    () => navItems.filter((item) => item.to !== routes.home),
    [],
  )

  // Collect all flat links for instant search
  const allLinks = useMemo(() => {
    const list: {
      title: string
      to: string
      icon: any
      moduleTitle: string
    }[] = []
    menuModules.forEach((mod) => {
      const links = mod.children?.length
        ? flattenNavChildren(mod.children)
        : [{ title: mod.title, to: mod.to, icon: mod.icon }]
      links.forEach((l) => {
        list.push({ ...l, moduleTitle: mod.title })
      })
    })
    return list
  }, [menuModules])

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return allLinks.filter(
      (link) =>
        link.title.toLowerCase().includes(q) ||
        link.moduleTitle.toLowerCase().includes(q),
    )
  }, [allLinks, searchQuery])

  const quickShortcuts = [
    {
      title: "Solicitudes de Mantenimiento",
      description: "Gestionar y enviar requerimientos técnicos",
      to: routes.mantenimientos.solicitudes,
      icon: FileText,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    {
      title: "Catálogo de Activos",
      description: "Exploración visual y detalle técnico de activos",
      to: routes.activos.catalogo,
      icon: LayoutGrid,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Reporte GRS (Documentos)",
      description: "Consulta y seguimiento documental de activos",
      to: routes.activos.consultaDocumentos,
      icon: FileSearch,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Personal y Empleados",
      description: "Directorio de personal y cargos asignados",
      to: routes.organizacion.empleados,
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
  ]

  return (
    <PageShell size="xl" layout="scroll" padding="default" className="gap-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 size-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                <Building2 className="size-3.5" />
                ENDE Corani S.A.
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                <Calendar className="size-3.5" />
                {formatCurrentDate()}
              </span>
            </div>

            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              {getGreeting()}, <span className="text-primary">{displayName}</span>
            </h1>

            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base leading-relaxed">
              Bienvenido al {appConfig.description}. Selecciona un módulo o utiliza el buscador rápido para acceder a las opciones del sistema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              size="default"
              render={<Link to={routes.mantenimientos.solicitudes} />}
              className="gap-2 shadow-xs"
            >
              <Wrench className="size-4" />
              <span>Mantenimiento</span>
            </Button>
            <Button
              variant="outline"
              size="default"
              render={<Link to={routes.activos.root} />}
              className="gap-2 hover:bg-muted/80"
            >
              <Boxes className="size-4 text-amber-500" />
              <span>Ver Activos</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="mt-6 pt-5 border-t border-border/40">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cualquier pantalla, reporte o configuración..."
              className="h-10.5 rounded-xl border-border/60 bg-background/80 pl-10 pr-9 text-sm shadow-xs backdrop-blur-xs transition-all hover:border-border/90 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                title="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Quick Search Live Results Dropdown */}
          {searchQuery && (
            <div className="mt-2.5 rounded-xl border border-border/70 bg-popover p-2 shadow-xl backdrop-blur-md max-w-xl animate-in fade-in-50 duration-150">
              <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resultados coincidentes ({filteredSearchResults.length})
              </div>
              {filteredSearchResults.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No se encontraron pantallas o menús para &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                  {filteredSearchResults.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to as any}
                      className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className="size-4 text-primary shrink-0" />
                        <span className="truncate text-foreground font-semibold">
                          {item.title}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                        {item.moduleTitle}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Shortcuts Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-bold tracking-tight sm:text-lg">
              Accesos Frecuentes
            </h2>
            <Badge variant="secondary" className="text-[11px] font-medium">
              Recomendados
            </Badge>
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {quickShortcuts.map((sc) => (
            <Link
              key={sc.to}
              to={sc.to as any}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105",
                    sc.color,
                  )}
                >
                  <sc.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {sc.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {sc.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Ingresar</span>
                <ChevronRight className="size-3.5 ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Module Overview & Navigation Grid */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-heading text-lg font-bold tracking-tight sm:text-xl">
              Módulos del Sistema
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explora las diferentes secciones y herramientas disponibles en SIGMA.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {menuModules.map((module) => {
            const meta = moduleMeta[module.title] || {
              description: "Accede a las opciones y registros de este módulo.",
              color: "text-primary bg-primary/10",
              badgeColor: "bg-primary/10 text-primary border-primary/20",
              gradient: "from-primary/10 via-primary/5 to-transparent",
              borderHover: "hover:border-primary/40",
            }

            const links = module.children?.length
              ? flattenNavChildren(module.children)
              : [{ title: module.title, to: module.to, icon: module.icon }]

            return (
              <Card
                key={module.title}
                className={cn(
                  "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-200 hover:shadow-lg",
                  meta.borderHover,
                )}
              >
                {/* Background ambient gradient */}
                <div
                  className={cn(
                    "absolute top-0 inset-x-0 h-24 bg-gradient-to-b opacity-60 pointer-events-none",
                    meta.gradient,
                  )}
                />

                <CardHeader className="relative z-10 pb-3 border-b border-border/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-200 hover:scale-105",
                          meta.color,
                        )}
                      >
                        <module.icon className="size-5.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-bold tracking-tight text-foreground font-heading">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-0.5">
                          {meta.description}
                        </CardDescription>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10.5px] font-semibold",
                        meta.badgeColor,
                      )}
                    >
                      {links.length} {links.length === 1 ? "opción" : "opciones"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 flex-1 pt-3 pb-3">
                  <div className="flex flex-col gap-1">
                    {links.slice(0, 5).map((link) => (
                      <Link
                        key={link.to}
                        to={link.to as any}
                        className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 hover:bg-muted/80 hover:translate-x-0.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <link.icon className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          <span className="truncate text-foreground/85 group-hover:text-foreground">
                            {link.title}
                          </span>
                        </div>
                        <ChevronRight className="size-3.5 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                      </Link>
                    ))}

                    {links.length > 5 && (
                      <div className="mt-1 px-2.5 text-[11px] text-muted-foreground font-medium">
                        +{links.length - 5} opciones más en el menú
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="relative z-10 border-t border-border/40 bg-muted/20 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Módulo operativo
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link to={links[0]?.to as any || (module.to as any)} />}
                    className="h-7 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1 px-2.5 rounded-lg"
                  >
                    <span>Explorar</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </section>
    </PageShell>
  )
}
