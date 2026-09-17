export interface BreadcrumbSegment {
  title: string
  href?: string
  isCurrent?: boolean
}

/**
 * Diccionario de títulos legibles para rutas y segmentos del sistema.
 */
export const SEGMENT_LABELS: Record<string, string> = {
  // Organización
  organizacion: "Organización",
  empleados: "Empleados",
  areas: "Áreas",
  cargos: "Cargos",
  personas: "Personas",
  responsabilidades: "Responsabilidades",
  "grupos-aprobadores": "Grupos Aprobadores",
  migraciones: "Logs de Migración",

  // Activos
  activos: "Activos",
  catalogo: "Catálogo",
  "consulta-documentos": "Consulta de Documentos",
  "tipos-activo": "Tipos de Activo",
  categorias: "Categorías",
  accesorios: "Accesorios",
  "tipos-documento": "Tipos de Documento",

  // Inventarios
  inventarios: "Inventarios",
  "tipos-insumo": "Tipos de Insumo",

  // Parámetros
  parametros: "Parámetros",
  gestion: "Gestión",
  catalogos: "Catálogos",
  "tipos-dato": "Tipos de Datos",
  ubicaciones: "Ubicaciones",
  "unidades-medida": "Unidades de Medida",

  // Mantenimientos
  mantenimientos: "Mantenimientos",
  solicitudes: "Solicitudes",
  aprobaciones: "Aprobaciones",
  encargado: "Encargado",
  supervisor: "Supervisor",
  actividades: "Actividades",
  "tipos-mantenimiento": "Tipos de Mantenimiento",
  prioridades: "Prioridades",
  "controles-activos": "Controles de Activos",
  "ordenes-trabajo": "Órdenes de Trabajo",

  // Seguridad
  seguridad: "Seguridad",
  usuarios: "Usuarios",
  roles: "Roles",
  menus: "Menús",

  // Acciones comunes
  nuevo: "Nuevo",
  nueva: "Nueva",
  editar: "Editar",
  atributos: "Atributos",
  componentes: "Componentes",
  historial: "Historial",
  perfil: "Mi Perfil",
  login: "Iniciar Sesión",
}

export function formatSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment]
  }

  // Detectar IDs numéricos o UUIDs
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
  const rawSegments = cleanPath.split("/").filter(Boolean)
  let accumulatedPath = ""

  rawSegments.forEach((segment, index) => {
    accumulatedPath += `/${segment}`
    const isLast = index === rawSegments.length - 1
    const title = formatSegment(segment)
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
