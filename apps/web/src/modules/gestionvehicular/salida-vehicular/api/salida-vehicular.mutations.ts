import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { salidaVehicularKeys } from "./salida-vehicular.keys"
import {
  actualizarSalida,
  cancelarSalida,
  ejecutarAccion,
  registrarBitacora,
  registrarSalida,
} from "./salida-vehicular.service"
import type {
  ActualizarSalidaVehicularRequest,
  CancelarSalidaVehicularRequest,
  EjecutarAccionSalidaRequest,
  RegistrarBitacoraRequest,
  RegistrarSalidaVehicularRequest,
} from "./salida-vehicular.types"

export function useRegistrarSalidaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegistrarSalidaVehicularRequest) => registrarSalida(data),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.activas() })
      toast.success(`Salida ${entity.numero} registrada e iniciada correctamente`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useActualizarSalidaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: ActualizarSalidaVehicularRequest
    }) => actualizarSalida(id, data),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.detail(entity.id),
      })
      void queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.lists() })
      toast.success("Salida vehicular actualizada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useCancelarSalidaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: CancelarSalidaVehicularRequest
    }) => cancelarSalida(id, data),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.detail(entity.id),
      })
      void queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.activas() })
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.tareaActual(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.acciones(entity.id),
      })
      toast.success("Salida vehicular cancelada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useEjecutarAccionSalidaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      accionId,
      data,
    }: {
      id: string
      accionId: string
      data?: EjecutarAccionSalidaRequest
    }) => ejecutarAccion(id, accionId, data),
    onSuccess: (entity) => {
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.detail(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.tareaActual(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.acciones(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.historial(entity.id),
      })
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.eventos(entity.id),
      })
      void queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: salidaVehicularKeys.activas() })
      toast.success("Acción de flujo ejecutada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useRegistrarBitacoraMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: RegistrarBitacoraRequest
    }) => registrarBitacora(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.bitacoras(id),
      })
      void queryClient.invalidateQueries({
        queryKey: salidaVehicularKeys.detail(id),
      })
      toast.success("Bitácora registrada correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
