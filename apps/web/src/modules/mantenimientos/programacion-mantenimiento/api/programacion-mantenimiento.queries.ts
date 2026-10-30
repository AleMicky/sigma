import { useQuery } from "@tanstack/react-query"
import { programacionMantenimientoKeys } from "./programacion-mantenimiento.keys"
import {
  getHistorial,
  getProgramacion,
  getProgramaciones,
  getProgramacionesByPlanActivo,
  getProgramacionesByActivo,
  type ListProgramacionesParams,
} from "./programacion-mantenimiento.service"

export function useProgramaciones(params?: ListProgramacionesParams) {
  return useQuery({
    queryKey: programacionMantenimientoKeys.list(params),
    queryFn: () => getProgramaciones(params),
  })
}

export function useProgramacion(id?: string) {
  return useQuery({
    queryKey: programacionMantenimientoKeys.detail(id ?? ""),
    queryFn: () => getProgramacion(id!),
    enabled: Boolean(id),
  })
}

export function useProgramacionesByPlanActivo(planActivoId?: string) {
  return useQuery({
    queryKey: programacionMantenimientoKeys.byPlanActivo(planActivoId ?? ""),
    queryFn: () => getProgramacionesByPlanActivo(planActivoId!),
    enabled: Boolean(planActivoId),
  })
}

export function useProgramacionesByActivo(activoId?: string) {
  return useQuery({
    queryKey: programacionMantenimientoKeys.byActivo(activoId ?? ""),
    queryFn: () => getProgramacionesByActivo(activoId!),
    enabled: Boolean(activoId),
  })
}

export function useHistorialProgramacion(id?: string) {
  return useQuery({
    queryKey: programacionMantenimientoKeys.historial(id ?? ""),
    queryFn: () => getHistorial(id!),
    enabled: Boolean(id),
  })
}
