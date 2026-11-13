import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { porteriaKeys } from "./porteria.keys"
import {
  anularRegistroPorteria,
  registrarLlegadaPorteria,
  registrarSalidaPorteria,
} from "./porteria.service"
import type {
  AnularRegistroPorteriaRequest,
  RegistrarLlegadaPorteriaRequest,
  RegistrarSalidaPorteriaRequest,
} from "./porteria.types"

export function useRegistrarSalidaPorteriaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegistrarSalidaPorteriaRequest) =>
      registrarSalidaPorteria(data),
    onSuccess: (registro) => {
      void queryClient.invalidateQueries({ queryKey: porteriaKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: porteriaKeys.afuera() })
      toast.success(`Salida ${registro.numero} registrada correctamente`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useRegistrarLlegadaPorteriaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: RegistrarLlegadaPorteriaRequest
    }) => registrarLlegadaPorteria(id, data),
    onSuccess: (registro) => {
      void queryClient.invalidateQueries({ queryKey: porteriaKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: porteriaKeys.afuera() })
      void queryClient.invalidateQueries({
        queryKey: porteriaKeys.detail(registro.id),
      })
      toast.success(`Llegada ${registro.numero} registrada correctamente`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useAnularRegistroPorteriaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data?: AnularRegistroPorteriaRequest
    }) => anularRegistroPorteria(id, data),
    onSuccess: (registro) => {
      void queryClient.invalidateQueries({ queryKey: porteriaKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: porteriaKeys.afuera() })
      toast.success(`Registro ${registro.numero} anulado`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

