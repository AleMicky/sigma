interface WorkflowRestLicencia {
  estado?: string | null
  numeroLicencia?: string | null
  categoriaLicencia?: string | null
}

export interface WorkflowRestRecord {
  id?: string | number | null
  value?: string | number | null
  codigo?: string | null
  placa?: string | null
  empleadoId?: string | number | null
  empleado?: {
    id?: string | number | null
    codigo?: string | null
    nombreCompleto?: string | null
    cargo?: string | null
    area?: string | null
    urlImagen?: string | null
    foto?: string | null
  } | null
  personaInfo?: {
    nombreCompleto?: string | null
    foto?: string | null
    fotoUrl?: string | null
  } | null
  personaNombreCompleto?: string | null
  nombreCompleto?: string | null
  denominacion?: string | null
  nombre?: string | null
  name?: string | null
  username?: string | null
  titulo?: string | null
  descripcion?: string | null
  label?: string | null
  cargoInfo?: { nombre?: string | null } | null
  cargoNombre?: string | null
  cargo?: string | null
  areaInfo?: { nombre?: string | null } | null
  areaNombre?: string | null
  area?: string | null
  email?: string | null
  urlImagen?: string | null
  foto?: string | null
  fotoUrl?: string | null
  imagen?: string | null
  avatar?: string | null
  avatarUrl?: string | null
  licencias?: WorkflowRestLicencia[] | null
  [key: string]: unknown
}

export type WorkflowRestOption = WorkflowRestRecord | string

export function isWorkflowRestRecord(item: unknown): item is WorkflowRestRecord {
  return typeof item === "object" && item !== null
}

export function extractRestItems(payload: unknown): WorkflowRestOption[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as WorkflowRestOption[]

  if (isWorkflowRestRecord(payload)) {
    if (Array.isArray(payload.data)) {
      return payload.data as WorkflowRestOption[]
    }
    if (
      isWorkflowRestRecord(payload.data) &&
      Array.isArray(payload.data.content)
    ) {
      return payload.data.content as WorkflowRestOption[]
    }
    if (Array.isArray(payload.content)) {
      return payload.content as WorkflowRestOption[]
    }
  }

  return []
}

export function getItemLabel(item: WorkflowRestOption | null | undefined): string {
  if (!item) return ""
  if (typeof item === "string") return item

  const codigo =
    item.codigo ||
    item.empleado?.codigo ||
    item.placa ||
    ""
  const prefix = codigo ? `[${codigo}] ` : ""

  const nombre =
    item.empleado?.nombreCompleto ||
    item.personaInfo?.nombreCompleto ||
    item.personaNombreCompleto ||
    item.nombreCompleto ||
    item.denominacion ||
    item.nombre ||
    item.name ||
    item.username ||
    item.titulo ||
    item.descripcion ||
    item.label ||
    ""

  const extra =
    item.cargoInfo?.nombre ||
    item.cargoNombre ||
    item.cargo ||
    item.empleado?.cargo ||
    item.areaInfo?.nombre ||
    item.areaNombre ||
    item.empleado?.area ||
    item.email ||
    ""

  if (!nombre && item.id) {
    return String(item.id)
  }

  if (extra && extra !== nombre) {
    return `${prefix}${nombre} (${extra})`
  }
  return `${prefix}${nombre}`
}

export function getItemImage(item: WorkflowRestOption | null | undefined): string | null {
  if (!isWorkflowRestRecord(item)) return null
  return (
    item.urlImagen ||
    item.foto ||
    item.fotoUrl ||
    item.imagen ||
    item.avatar ||
    item.avatarUrl ||
    item.empleado?.urlImagen ||
    item.empleado?.foto ||
    item.personaInfo?.foto ||
    item.personaInfo?.fotoUrl ||
    null
  )
}

export function getItemInitials(name: string): string {
  if (!name) return "??"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase() || "??"
}

export function getItemSecondaryText(item: WorkflowRestOption | null | undefined): string | null {
  if (!isWorkflowRestRecord(item)) return null

  const parts: string[] = []

  const cargo =
    item.cargoInfo?.nombre ||
    item.cargoNombre ||
    item.cargo ||
    item.empleado?.cargo

  const area =
    item.areaInfo?.nombre ||
    item.areaNombre ||
    item.area ||
    item.empleado?.area

  if (cargo) parts.push(cargo)
  if (area && area !== cargo) parts.push(area)

  if (Array.isArray(item.licencias) && item.licencias.length > 0) {
    const lic =
      item.licencias.find((l) => l.estado === "VIGENTE") || item.licencias[0]
    if (lic?.numeroLicencia) {
      parts.push(
        `Lic: ${lic.numeroLicencia}${lic.categoriaLicencia ? ` (${lic.categoriaLicencia})` : ""}`,
      )
    }
  }

  return parts.length > 0 ? parts.join(" • ") : null
}

export function getItemId(
  item: WorkflowRestOption | null | undefined,
  fieldId?: string,
  valueField?: string,
): string {
  if (!item) return ""
  if (typeof item === "string") return item

  if (valueField && item[valueField] !== undefined) {
    return String(item[valueField])
  }

  // Si el campo objetivo es para un empleado/responsable (e.g. responsableId, empleadoId)
  // y el objeto viene de /conductores, el ID que requiere la entidad Empleado es empleadoId
  const isEmpleadoTarget =
    Boolean(fieldId) &&
    (fieldId!.toLowerCase().includes("responsable") ||
      fieldId!.toLowerCase().includes("empleado"))

  if (isEmpleadoTarget && (item.empleadoId || item.empleado?.id)) {
    return String(item.empleadoId || item.empleado?.id)
  }

  return String(item.id ?? item.value ?? item.codigo ?? "")
}

export function getItemDisplayName(item: WorkflowRestOption): string {
  if (typeof item === "string") return item
  return (
    item.empleado?.nombreCompleto ||
    item.personaInfo?.nombreCompleto ||
    item.personaNombreCompleto ||
    item.nombreCompleto ||
    item.denominacion ||
    item.nombre ||
    item.name ||
    item.label ||
    getItemLabel(item)
  )
}

export function matchesItemValue(
  item: WorkflowRestOption,
  value: string,
  fieldId?: string,
  valueField?: string,
): boolean {
  const idVal = getItemId(item, fieldId, valueField)
  if (idVal === value) return true
  if (!isWorkflowRestRecord(item)) return false

  return (
    String(item.id) === value ||
    Boolean(item.empleadoId && String(item.empleadoId) === value) ||
    Boolean(item.empleado?.id && String(item.empleado.id) === value)
  )
}
