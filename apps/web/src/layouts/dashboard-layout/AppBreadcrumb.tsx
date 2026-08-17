import { Fragment } from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { Home } from "lucide-react"

import { routes } from "@/app/config"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb"

export interface BreadcrumbSegment {
  title: string
  href?: string
  isCurrent?: boolean
}

// Map for explicit route titles
const pathLabels: Record<string, string> = {
  // Organización
  "/organizacion": "Organización",
  "/organizacion/empleados": "Empleados",
  "/organizacion/areas": "Áreas",
  "/organizacion/cargos": "Cargos",
  "/organizacion/personas": "Personas",
  "/organizacion/migraciones": "Logs de Migración",

  // Activos
  "/activos": "Activos",
  "/activos/nuevo": "Nuevo Activo",
  "/activos/catalogo": "Catálogo de Activos",
  "/activos/consulta-documentos": "Consulta de Documentos",
  "/tipos-activo": "Tipos de Activo",
  "/tipos-activo/historial": "Historial",
  "/categorias": "Categorías",
  "/accesorios": "Accesorios",
  "/tipos-documento": "Tipos de Documento",

  // Inventarios
  "/inventarios": "Inventarios",
  "/inventarios/nuevo": "Nuevo Insumo",
  "/inventarios/tipos-insumo": "Tipos de Insumo",
  "/inventarios/categorias": "Categorías",

  // Parámetros
  "/parametros": "Parámetros",
  "/parametros/gestion": "Gestión",
  "/parametros/catalogos": "Catálogos",
  "/parametros/tipos-dato": "Tipos de Datos",
  "/parametros/ubicaciones": "Ubicaciones",
  "/parametros/unidades-medida": "Unidades de Medida",

  // Mantenimientos
  "/mantenimientos": "Mantenimientos",
  "/mantenimientos/tipos-mantenimiento": "Tipos de Mantenimiento",
  "/mantenimientos/prioridades": "Prioridades",

  // Perfil
  "/perfil": "Mi Perfil",
}

// Translations / readable titles for path segments
const segmentLabels: Record<string, string> = {
  activos: "Activos",
  organizacion: "Organización",
  inventarios: "Inventarios",
  parametros: "Parámetros",
  mantenimientos: "Mantenimientos",
  "tipos-mantenimiento": "Tipos de Mantenimiento",
  prioridades: "Prioridades",
  "tipos-activo": "Tipos de Activo",
  "tipos-insumo": "Tipos de Insumo",
  "tipos-documento": "Tipos de Documento",
  "tipos-dato": "Tipos de Datos",
  "unidades-medida": "Unidades de Medida",
  empleados: "Empleados",
  areas: "Áreas",
  cargos: "Cargos",
  personas: "Personas",
  migraciones: "Logs de Migración",
  categorias: "Categorías",
  accesorios: "Accesorios",
  gestion: "Gestión",
  catalogos: "Catálogos",
  ubicaciones: "Ubicaciones",
  nuevo: "Nuevo",
  editar: "Editar",
  atributos: "Atributos",
  componentes: "Componentes",
  historial: "Historial",
  perfil: "Mi Perfil",
}

function formatSegment(segment: string): string {
  if (segmentLabels[segment]) {
    return segmentLabels[segment]
  }

  // Detect IDs / UUIDs
  if (/^[0-9a-fA-F-]{8,}$/.test(segment) || /^\d+$/.test(segment)) {
    return "Detalle"
  }

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function generateBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const cleanPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname

  if (cleanPath === "/" || cleanPath === "") {
    return [{ title: "Inicio", isCurrent: true }]
  }

  const items: BreadcrumbSegment[] = [{ title: "Inicio", href: "/" }]

  // Group sub-modules under their logical parent if applicable
  const isActivosSubModule =
    cleanPath.startsWith("/tipos-activo") ||
    cleanPath.startsWith("/categorias") ||
    cleanPath.startsWith("/accesorios") ||
    cleanPath.startsWith("/tipos-documento")

  if (isActivosSubModule) {
    items.push({ title: "Activos", href: routes.activos.root })
  }

  const rawSegments = cleanPath.split("/").filter(Boolean)
  let accumulatedPath = ""

  rawSegments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`
    const isLast = index === rawSegments.length - 1

    const title = pathLabels[accumulatedPath] || formatSegment(segment)
    const isId = /^[0-9a-fA-F-]{8,}$/.test(segment) || /^\d+$/.test(segment)

    items.push({
      title,
      href: isLast || isId ? undefined : accumulatedPath,
      isCurrent: isLast,
    })
  })

  if (items.length > 0) {
    items[items.length - 1].isCurrent = true
    items[items.length - 1].href = undefined
  }

  return items
}

export function AppBreadcrumb() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <Breadcrumb className="flex items-center">
      <BreadcrumbList className="flex items-center gap-1.5 text-xs text-muted-foreground flex-nowrap overflow-hidden">
        {breadcrumbs.map((item, index) => {
          const isFirst = index === 0

          return (
            <Fragment key={`${item.title}-${index}`}>
              {index > 0 && <BreadcrumbSeparator className="size-3.5 shrink-0 opacity-60" />}
              <BreadcrumbItem className="inline-flex items-center min-w-0">
                {item.isCurrent ? (
                  <BreadcrumbPage className="font-medium text-foreground truncate max-w-40 sm:max-w-60 md:max-w-none">
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={item.href as any} />}
                    className="flex items-center gap-1 transition-colors hover:text-foreground shrink-0"
                  >
                    {isFirst && <Home className="size-3.5" />}
                    <span>{item.title}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
