import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { flotaKeys } from "./flota.keys"
import {
  type FlotaVehicularRequest,
  type FlotaVehicularUpdate,
  type FlotaVehiculoBatchRequest,
  type FlotaVehiculoRequest,
  type ResponsableFlotaRequest,
  type ResponsableFlotaUpdate,
  type SincronizarFlotaVehiculosRequest,
  flotaService,
} from "./flota.service"

export function useCreateFlota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FlotaVehicularRequest) => flotaService.create(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.all })
      toast.success("Flota vehicular creada", {
        description: `Se creó la flota "${saved.nombre}" exitosamente.`,
      })
    },
    onError: (error) => {
      toast.error("Error al crear flota", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useUpdateFlota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FlotaVehicularUpdate }) =>
      flotaService.update(id, data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.all })
      toast.success("Flota vehicular actualizada", {
        description: `Se actualizó la flota "${saved.nombre}".`,
      })
    },
    onError: (error) => {
      toast.error("Error al actualizar flota", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useToggleActivoFlota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => flotaService.toggleActivo(id),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.all })
      toast.success(
        saved.activo ? "Flota activada" : "Flota desactivada",
        {
          description: `La flota "${saved.nombre}" ahora está ${
            saved.activo ? "activa" : "inactiva"
          }.`,
        }
      )
    },
    onError: (error) => {
      toast.error("Error al cambiar estado", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useDeleteFlota() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => flotaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.all })
      toast.success("Flota eliminada", {
        description: "La flota vehicular ha sido eliminada correctamente.",
      })
    },
    onError: (error) => {
      toast.error("Error al eliminar flota", {
        description: getErrorMessage(error),
      })
    },
  })
}

// VEHICULOS MUTATIONS
export function useAsignarVehiculos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FlotaVehiculoRequest) => flotaService.asignarVehiculos(data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.vehiculos(vars.flotaVehicularId) })
      queryClient.invalidateQueries({ queryKey: flotaKeys.lists() })
      toast.success("Vehículo(s) asignado(s)", {
        description: "Se agregaron los vehículos a la flota vehicular.",
      })
    },
    onError: (error) => {
      toast.error("Error al asignar vehículos", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useAsignarVehiculosBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FlotaVehiculoBatchRequest) => flotaService.asignarVehiculosBatch(data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.vehiculos(vars.flotaVehicularId) })
      queryClient.invalidateQueries({ queryKey: flotaKeys.lists() })
      toast.success("Vehículos asignados", {
        description: "Se asignó el lote de vehículos a la flota.",
      })
    },
    onError: (error) => {
      toast.error("Error al asignar lote de vehículos", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useSincronizarVehiculos() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ flotaId, data }: { flotaId: string; data: SincronizarFlotaVehiculosRequest }) =>
      flotaService.sincronizarVehiculos(flotaId, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.vehiculos(vars.flotaId) })
      queryClient.invalidateQueries({ queryKey: flotaKeys.lists() })
      toast.success("Vehículos sincronizados", {
        description: "Se actualizó la lista de vehículos de la flota.",
      })
    },
    onError: (error) => {
      toast.error("Error al sincronizar vehículos", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useToggleActivoVehiculo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; flotaId: string }) =>
      flotaService.toggleActivoVehiculo(id),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.vehiculos(vars.flotaId) })
      toast.success("Estado de vehículo actualizado")
    },
    onError: (error) => {
      toast.error("Error al cambiar estado de vehículo", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useDeleteVehiculo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; flotaId: string }) =>
      flotaService.deleteVehiculo(id),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.vehiculos(vars.flotaId) })
      queryClient.invalidateQueries({ queryKey: flotaKeys.lists() })
      toast.success("Vehículo desvinculado", {
        description: "El vehículo fue desvinculado de la flota.",
      })
    },
    onError: (error) => {
      toast.error("Error al desvincular vehículo", {
        description: getErrorMessage(error),
      })
    },
  })
}

// RESPONSABLES MUTATIONS
export function useAsignarResponsable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ResponsableFlotaRequest) => flotaService.asignarResponsable(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.responsables(saved.flotaVehicularId) })
      toast.success("Responsable asignado", {
        description: "El empleado fue asignado como responsable de la flota.",
      })
    },
    onError: (error) => {
      toast.error("Error al asignar responsable", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useUpdateResponsable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResponsableFlotaUpdate }) =>
      flotaService.updateResponsable(id, data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.responsables(saved.flotaVehicularId) })
      toast.success("Responsable actualizado")
    },
    onError: (error) => {
      toast.error("Error al actualizar responsable", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useSetResponsablePrincipal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; flotaId: string }) =>
      flotaService.setResponsablePrincipal(id),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.responsables(vars.flotaId) })
      toast.success("Responsable principal actualizado", {
        description: "Se estableció el nuevo responsable principal de la flota.",
      })
    },
    onError: (error) => {
      toast.error("Error al definir responsable principal", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useToggleActivoResponsable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; flotaId: string }) =>
      flotaService.toggleActivoResponsable(id),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.responsables(vars.flotaId) })
      toast.success("Estado de responsable actualizado")
    },
    onError: (error) => {
      toast.error("Error al cambiar estado", {
        description: getErrorMessage(error),
      })
    },
  })
}

export function useDeleteResponsable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; flotaId: string }) =>
      flotaService.deleteResponsable(id),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: flotaKeys.responsables(vars.flotaId) })
      toast.success("Responsable desvinculado", {
        description: "El responsable fue desvinculado de la flota.",
      })
    },
    onError: (error) => {
      toast.error("Error al desvincular responsable", {
        description: getErrorMessage(error),
      })
    },
  })
}
