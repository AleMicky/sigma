import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "@/shared/api"

import { catalogoKeys } from "./catalogo.keys"
import {
  createCatalogo,
  deleteCatalogo,
  updateCatalogo,
  type CatalogoPayload,
} from "./catalogo.service"

export function useCreateCatalogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCatalogo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogoKeys.lists() })
      toast.success("Catálogo creado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useUpdateCatalogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CatalogoPayload
    }) => updateCatalogo(id, payload),
    onSuccess: (catalogo) => {
      void queryClient.invalidateQueries({ queryKey: catalogoKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: catalogoKeys.detail(catalogo.id),
      })
      toast.success("Catálogo actualizado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDeleteCatalogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCatalogo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogoKeys.all })
      toast.success("Catálogo eliminado correctamente")
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
