import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { programacionMantenimientoKeys } from "./programacion-mantenimiento.keys"
import {
  activarCriterio,
  activarProgramacion,
  completarMantenimiento,
  createCriterio,
  createProgramacion,
  crearPorTipoActivo,
  deleteCriterio,
  deleteProgramacion,
  desactivarCriterio,
  desactivarProgramacion,
  evaluarProgramacion,
  evaluarTodasProgramaciones,
  updateCriterio,
  updateProgramacion,
  type CompletarMantenimientoPayload,
  type EvaluarProgramacionPayload,
  type ProgramacionMantenimientoCriterioPayload,
  type ProgramacionMantenimientoPayload,
  type ProgramacionMantenimientoUpdatePayload,
  type ProgramacionTipoActivoBatchPayload,
} from "./programacion-mantenimiento.service"

export function useCreateProgramacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProgramacionMantenimientoPayload) => createProgramacion(payload),
    onSuccess: () => {
      toast.success("Programación de mantenimiento creada correctamente")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al crear la programación de mantenimiento"
      toast.error(msg)
    },
  })
}

export function useCrearPorTipoActivo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProgramacionTipoActivoBatchPayload) => crearPorTipoActivo(payload),
    onSuccess: (res) => {
      toast.success(res?.mensaje ?? "Programaciones preventivas aplicadas al tipo de activo")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al aplicar programación por tipo de activo"
      toast.error(msg)
    },
  })
}

export function useUpdateProgramacion(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id: targetId, payload }: { id?: string; payload: ProgramacionMantenimientoUpdatePayload }) =>
      updateProgramacion(targetId ?? id ?? "", payload),
    onSuccess: () => {
      toast.success("Programación actualizada correctamente")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al actualizar la programación"
      toast.error(msg)
    },
  })
}

export function useActivarProgramacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => activarProgramacion(id),
    onSuccess: () => {
      toast.success("Programación activada")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al activar la programación"
      toast.error(msg)
    },
  })
}

export function useDesactivarProgramacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => desactivarProgramacion(id),
    onSuccess: () => {
      toast.success("Programación desactivada")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al desactivar la programación"
      toast.error(msg)
    },
  })
}

export function useDeleteProgramacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProgramacion(id),
    onSuccess: () => {
      toast.success("Programación eliminada")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al eliminar la programación"
      toast.error(msg)
    },
  })
}

export function useEvaluarProgramacion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: EvaluarProgramacionPayload }) =>
      evaluarProgramacion(id, payload),
    onSuccess: (data) => {
      if (data.solicitudGenerada) {
        toast.success(data.mensaje)
      } else if (data.yaExistiaSolicitudAbierta) {
        toast.info(data.mensaje)
      } else {
        toast.info(data.mensaje)
      }
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al evaluar la programación"
      toast.error(msg)
    },
  })
}

export function useEvaluarTodasProgramaciones() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => evaluarTodasProgramaciones(),
    onSuccess: (data) => {
      if (data.solicitudesGeneradas > 0) {
        toast.success(
          `Evaluación en lote completada: se generaron ${data.solicitudesGeneradas} nueva(s) solicitud(es) preventiva(s).`,
        )
      } else if (data.yaExistiaSolicitudAbierta > 0) {
        toast.info(
          `Evaluación en lote: ${data.totalEvaluadas} programaciones evaluadas. Ya existen solicitudes preventivas abiertas.`,
        )
      } else {
        toast.info(
          `Evaluación en lote: ${data.totalEvaluadas} programaciones evaluadas. Ningún activo requiere mantenimiento preventivo por el momento.`,
        )
      }
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        "Error al evaluar las programaciones de mantenimiento en lote"
      toast.error(msg)
    },
  })
}

export function useCompletarMantenimiento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompletarMantenimientoPayload }) =>
      completarMantenimiento(id, payload),
    onSuccess: () => {
      toast.success("Mantenimiento completado y criterios recalculados con éxito")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al completar el mantenimiento"
      toast.error(msg)
    },
  })
}

export function useCreateCriterio(programacionId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      programacionId: progId,
      payload,
    }: {
      programacionId?: string
      payload: ProgramacionMantenimientoCriterioPayload
    }) => createCriterio(progId ?? programacionId ?? "", payload),
    onSuccess: () => {
      toast.success("Criterio agregado a la programación")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al agregar el criterio"
      toast.error(msg)
    },
  })
}

export function useUpdateCriterio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProgramacionMantenimientoCriterioPayload> }) =>
      updateCriterio(id, payload),
    onSuccess: () => {
      toast.success("Criterio actualizado")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al actualizar el criterio"
      toast.error(msg)
    },
  })
}

export function useActivarCriterio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => activarCriterio(id),
    onSuccess: () => {
      toast.success("Criterio activado")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al activar el criterio"
      toast.error(msg)
    },
  })
}

export function useDesactivarCriterio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => desactivarCriterio(id),
    onSuccess: () => {
      toast.success("Criterio desactivado")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al desactivar el criterio"
      toast.error(msg)
    },
  })
}

export function useDeleteCriterio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCriterio(id),
    onSuccess: () => {
      toast.success("Criterio eliminado")
      queryClient.invalidateQueries({ queryKey: programacionMantenimientoKeys.all })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Error al eliminar el criterio"
      toast.error(msg)
    },
  })
}
