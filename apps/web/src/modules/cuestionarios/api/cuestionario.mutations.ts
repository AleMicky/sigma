import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { cuestionarioKeys } from "./cuestionario.keys"
import { cuestionarioService } from "./cuestionario.service"
import type {
  CuestionarioPayload,
  GuardarPreguntasPayload,
  ResponderAsignacionPayload,
} from "./cuestionario.types"

export function useCreateCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CuestionarioPayload) =>
      cuestionarioService.create(payload),
    onSuccess: (created) => {
      queryClient.setQueryData(cuestionarioKeys.detail(created.id), created)
      void queryClient.invalidateQueries({ queryKey: cuestionarioKeys.lists() })
      toast.success("Cuestionario creado correctamente")
    },
  })
}

export function useUpdateCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CuestionarioPayload
    }) => cuestionarioService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(cuestionarioKeys.detail(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: cuestionarioKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: cuestionarioKeys.reportes(),
      })
      toast.success("Cuestionario actualizado")
    },
  })
}

export function useDeleteCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cuestionarioService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: cuestionarioKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: cuestionarioKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: cuestionarioKeys.reportes(),
      })
      toast.success("Cuestionario eliminado")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useGuardarPreguntasCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: GuardarPreguntasPayload
    }) => cuestionarioService.guardarPreguntas(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(cuestionarioKeys.detail(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: cuestionarioKeys.lists() })
      toast.success("Preguntas guardadas correctamente")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function usePublicarCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      reemplazarActivo = false,
    }: {
      id: string
      reemplazarActivo?: boolean
    }) => cuestionarioService.publicar(id, reemplazarActivo),
    onSuccess: (updated) => {
      queryClient.setQueryData(cuestionarioKeys.detail(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: cuestionarioKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: cuestionarioKeys.reportes(),
      })
      toast.success("Cuestionario publicado correctamente")
    },
  })
}

export function useInactivarCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cuestionarioService.inactivar(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(cuestionarioKeys.detail(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: cuestionarioKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: cuestionarioKeys.reportes(),
      })
      toast.success("Cuestionario inactivado")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useNuevaVersionCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cuestionarioService.nuevaVersion(id),
    onSuccess: (created) => {
      queryClient.setQueryData(cuestionarioKeys.detail(created.id), created)
      void queryClient.invalidateQueries({ queryKey: cuestionarioKeys.lists() })
      toast.success(`Nueva versión v${created.version} creada en borrador`)
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export function useResponderAsignacionCuestionario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: ResponderAsignacionPayload
    }) => cuestionarioService.responderAsignacion(id, payload),
    onSuccess: (detail) => {
      queryClient.setQueryData(
        cuestionarioKeys.asignacionDetail(detail.asignacion.id),
        detail,
      )
      void queryClient.invalidateQueries({
        queryKey: cuestionarioKeys.asignaciones(),
      })
      void queryClient.invalidateQueries({
        queryKey: cuestionarioKeys.reportes(),
      })
      void queryClient.invalidateQueries({
        queryKey: cuestionarioKeys.lists(),
      })
      toast.success("Evaluación enviada correctamente")
    },
  })
}
