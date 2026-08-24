import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { ordenTrabajoKeys } from "./orden-trabajo.keys"
import {
  createOrdenTrabajo,
  createOrdenTrabajoActividad,
  createOrdenTrabajoActividadEvidenciaWithFile,
  createOrdenTrabajoAdjuntoWithFile,
  deleteOrdenTrabajo,
  deleteOrdenTrabajoActividad,
  deleteOrdenTrabajoActividadEvidencia,
  deleteOrdenTrabajoAdjunto,
  replaceOrdenTrabajoActividadEvidenciaFile,
  replaceOrdenTrabajoAdjuntoFile,
  updateOrdenTrabajo,
  updateOrdenTrabajoActividad,
  type OrdenTrabajoActividadPayload,
  type OrdenTrabajoAdjuntoPayload,
  type OrdenTrabajoPayload,
} from "./orden-trabajo.service"

// ----------------------------------------------------
// 1. Orden de Trabajo Mutations
// ----------------------------------------------------

export function useCreateOrdenTrabajo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: OrdenTrabajoPayload) => createOrdenTrabajo(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ordenTrabajoKeys.all })
      toast.success(`Orden de Trabajo ${data.numero ?? ""} creada exitosamente`)
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al crear la orden de trabajo")
    },
  })
}

export function useUpdateOrdenTrabajo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: OrdenTrabajoPayload
    }) => updateOrdenTrabajo(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ordenTrabajoKeys.all })
      toast.success(
        `Orden de Trabajo ${data.numero ?? ""} actualizada correctamente`,
      )
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(err) || "Error al actualizar la orden de trabajo",
      )
    },
  })
}

export function useDeleteOrdenTrabajo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOrdenTrabajo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordenTrabajoKeys.all })
      toast.success("Orden de trabajo eliminada correctamente")
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(err) || "Error al eliminar la orden de trabajo",
      )
    },
  })
}

// ----------------------------------------------------
// 2. Orden de Trabajo Adjuntos Mutations
// ----------------------------------------------------

export function useCreateOrdenTrabajoAdjunto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ordenTrabajoId,
      payload,
      file,
    }: {
      ordenTrabajoId: string
      payload?: OrdenTrabajoAdjuntoPayload
      file: File
    }) => createOrdenTrabajoAdjuntoWithFile(ordenTrabajoId, payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.adjuntosAll(),
      })
      toast.success("Adjunto subido correctamente")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al subir el adjunto")
    },
  })
}

export function useReplaceOrdenTrabajoAdjunto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ordenTrabajoId,
      id,
      file,
    }: {
      ordenTrabajoId: string
      id: string
      file: File
    }) => replaceOrdenTrabajoAdjuntoFile(ordenTrabajoId, id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.adjuntosAll(),
      })
      toast.success("Archivo del adjunto reemplazado correctamente")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al reemplazar el archivo")
    },
  })
}

export function useDeleteOrdenTrabajoAdjunto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ordenTrabajoId,
      id,
    }: {
      ordenTrabajoId: string
      id: string
    }) => deleteOrdenTrabajoAdjunto(ordenTrabajoId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.adjuntosAll(),
      })
      toast.success("Adjunto eliminado correctamente")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al eliminar el adjunto")
    },
  })
}

// ----------------------------------------------------
// 3. Actividades Mutations
// ----------------------------------------------------

export function useCreateOrdenTrabajoActividad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: OrdenTrabajoActividadPayload) =>
      createOrdenTrabajoActividad(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesAll,
      })
      toast.success("Actividad registrada correctamente")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al registrar la actividad")
    },
  })
}

export function useUpdateOrdenTrabajoActividad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: OrdenTrabajoActividadPayload
    }) => updateOrdenTrabajoActividad(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesAll,
      })
      toast.success("Actividad actualizada correctamente")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al actualizar la actividad")
    },
  })
}

export function useToggleOrdenTrabajoActividadRealizado() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: OrdenTrabajoActividadPayload
    }) => updateOrdenTrabajoActividad(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesAll,
      })
      toast.success(
        data.realizado ? "Actividad completada" : "Actividad marcada como pendiente",
      )
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al actualizar estado")
    },
  })
}

export function useDeleteOrdenTrabajoActividad() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOrdenTrabajoActividad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesAll,
      })
      toast.success("Actividad eliminada")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al eliminar la actividad")
    },
  })
}

// ----------------------------------------------------
// 4. Evidencias Mutations
// ----------------------------------------------------

export function useCreateOrdenTrabajoActividadEvidencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      actividadId,
      file,
    }: {
      actividadId: string
      file: File
    }) => createOrdenTrabajoActividadEvidenciaWithFile(actividadId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesAll,
      })
      toast.success("Evidencia adjuntada con éxito")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al subir la evidencia")
    },
  })
}

export function useReplaceOrdenTrabajoActividadEvidencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      actividadId,
      id,
      file,
    }: {
      actividadId: string
      id: string
      file: File
    }) => replaceOrdenTrabajoActividadEvidenciaFile(actividadId, id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesAll,
      })
      toast.success("Archivo de evidencia reemplazado")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al reemplazar la evidencia")
    },
  })
}

export function useDeleteOrdenTrabajoActividadEvidencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      actividadId,
      id,
    }: {
      actividadId: string
      id: string
    }) => deleteOrdenTrabajoActividadEvidencia(actividadId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordenTrabajoKeys.actividadesAll,
      })
      toast.success("Evidencia eliminada")
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al eliminar la evidencia")
    },
  })
}

// ----------------------------------------------------
// 5. Composite Master-Detail Mutation
// ----------------------------------------------------

export type CreateOrdenTrabajoWithActividadesInput = {
  maestro: OrdenTrabajoPayload
  actividades: Array<Omit<OrdenTrabajoActividadPayload, "ordenTrabajoId">>
}

export function useCreateOrdenTrabajoWithActividades() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      maestro,
      actividades,
    }: CreateOrdenTrabajoWithActividadesInput) => {
      const ot = await createOrdenTrabajo(maestro)

      if (actividades.length > 0) {
        for (const act of actividades) {
          try {
            await createOrdenTrabajoActividad({
              ...act,
              ordenTrabajoId: ot.id,
            })
          } catch (e) {
            console.error("Error al registrar actividad de la OT:", e)
          }
        }
      }

      return ot
    },
    onSuccess: (ot) => {
      queryClient.invalidateQueries({ queryKey: ordenTrabajoKeys.all })
      toast.success(`Orden de Trabajo ${ot.numero ?? ""} creada exitosamente`)
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Error al crear la orden de trabajo")
    },
  })
}

