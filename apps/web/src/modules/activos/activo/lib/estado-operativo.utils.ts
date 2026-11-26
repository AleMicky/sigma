import type { EstadoOperativo } from "@/modules/activos/estado-operativo/api/estado-operativo.service"
import type { TipoActivoEstado } from "@/modules/activos/tipo-activo-estado/api/tipo-activo-estado.service"

/**
 * Estados operativos habilitados para un tipo de activo según el catálogo
 * `tipos_activo_estados`. El backend rechaza con 422 cualquier estado que no
 * pertenezca al tipo, por lo que el selector debe derivar sus opciones de este
 * catálogo y no del listado global de estados.
 */
export function resolveEstadosDelTipo(
  asignaciones: TipoActivoEstado[],
  estados: EstadoOperativo[],
): EstadoOperativo[] {
  const permitidos = new Set(
    asignaciones.map((asignacion) => asignacion.estadoOperativoId),
  )
  return estados.filter((estado) => permitidos.has(estado.id))
}

/**
 * Estado predeterminado del tipo. El backend lo aplica cuando el request no
 * trae `estadoOperativoId`; la Web lo refleja en el formulario mientras el
 * usuario no haya elegido uno explícitamente.
 */
export function resolveEstadoPredeterminadoId(
  asignaciones: TipoActivoEstado[],
): string | null {
  return (
    asignaciones.find((asignacion) => asignacion.predeterminado)
      ?.estadoOperativoId ?? null
  )
}

/**
 * En edición, un activo puede tener un estado que ya no está en el catálogo
 * del tipo. Se mantiene como opción para no dejar el select sin valor válido,
 * pero se colocan primero las opciones permitidas.
 */
export function includeCurrentEstadoOption(
  estadosDelTipo: EstadoOperativo[],
  estadoActualId: string,
  todosLosEstados: EstadoOperativo[],
): EstadoOperativo[] {
  if (!estadoActualId || estadosDelTipo.some((e) => e.id === estadoActualId)) {
    return estadosDelTipo
  }

  const estadoActual = todosLosEstados.find((e) => e.id === estadoActualId)
  return estadoActual ? [estadoActual, ...estadosDelTipo] : estadosDelTipo
}
