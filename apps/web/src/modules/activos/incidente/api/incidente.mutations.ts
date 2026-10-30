import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { incidenteKeys } from "./incidente.keys"
import {
  actualizarIncidente,
  actualizarInvolucrado,
  cancelarIncidente,
  ejecutarAccionIncidente,
  eliminarEvidencia,
  eliminarInvolucrado,
  registrarIncidente,
  registrarInvolucrado,
  subirEvidencia,
} from "./incidente.service"
import type {
  ActualizarIncidenteRequest,
  ActualizarInvolucradoRequest,
  CancelarIncidenteRequest,
  EjecutarAccionIncidenteRequest,
  RegistrarIncidenteRequest,
  RegistrarInvolucradoRequest,
} from "./incidente.types"

export const useRegistrarIncidenteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegistrarIncidenteRequest) => registrarIncidente(data),
    onSuccess: () => {
      toast.success("Incidente registrado exitosamente")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al registrar el incidente")
    },
  })
}

export const useActualizarIncidenteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActualizarIncidenteRequest }) =>
      actualizarIncidente(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Incidente actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.lists() })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al actualizar el incidente")
    },
  })
}

export const useCancelarIncidenteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelarIncidenteRequest }) =>
      cancelarIncidente(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Incidente cancelado exitosamente")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.tareaActual(id) })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al cancelar el incidente")
    },
  })
}

export const useEjecutarAccionIncidenteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      accionId,
      data,
    }: {
      id: string
      accionId: string
      data?: EjecutarAccionIncidenteRequest
    }) => ejecutarAccionIncidente(id, accionId, data),
    onSuccess: (_, { id }) => {
      toast.success("Acción ejecutada correctamente")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.tareaActual(id) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.acciones(id) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.historial(id) })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al ejecutar la acción de flujo")
    },
  })
}

// Involucrados
export const useRegistrarInvolucradoMutation = (incidenteId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegistrarInvolucradoRequest) =>
      registrarInvolucrado(incidenteId, data),
    onSuccess: () => {
      toast.success("Involucrado agregado exitosamente")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.involucrados(incidenteId) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(incidenteId) })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al agregar involucrado")
    },
  })
}

export const useActualizarInvolucradoMutation = (incidenteId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      involucradoId,
      data,
    }: {
      involucradoId: string
      data: ActualizarInvolucradoRequest
    }) => actualizarInvolucrado(incidenteId, involucradoId, data),
    onSuccess: () => {
      toast.success("Involucrado actualizado")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.involucrados(incidenteId) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(incidenteId) })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al actualizar involucrado")
    },
  })
}

export const useEliminarInvolucradoMutation = (incidenteId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (involucradoId: string) => eliminarInvolucrado(incidenteId, involucradoId),
    onSuccess: () => {
      toast.success("Involucrado eliminado")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.involucrados(incidenteId) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(incidenteId) })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al eliminar involucrado")
    },
  })
}

// Evidencias
export const useSubirEvidenciaMutation = (incidenteId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => subirEvidencia(incidenteId, file),
    onSuccess: () => {
      toast.success("Archivo de evidencia subido con éxito")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.evidencias(incidenteId) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(incidenteId) })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al subir la evidencia")
    },
  })
}

export const useEliminarEvidenciaMutation = (incidenteId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evidenciaId: string) => eliminarEvidencia(incidenteId, evidenciaId),
    onSuccess: () => {
      toast.success("Evidencia eliminada")
      queryClient.invalidateQueries({ queryKey: incidenteKeys.evidencias(incidenteId) })
      queryClient.invalidateQueries({ queryKey: incidenteKeys.detail(incidenteId) })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al eliminar la evidencia")
    },
  })
}

