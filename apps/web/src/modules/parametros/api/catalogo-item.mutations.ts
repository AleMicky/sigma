import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogoItemKeys } from "./catalogo-item.keys"
import {
  createCatalogoItem,
  deleteCatalogoItem,
  updateCatalogoItem,
  type CatalogoItemPayload,
} from "./catalogo-item.service"

export function useCreateCatalogoItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCatalogoItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: catalogoItemKeys.lists(),
      })
    },
  })
}

export function useUpdateCatalogoItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: CatalogoItemPayload
    }) => updateCatalogoItem(id, payload),
    onSuccess: (item) => {
      void queryClient.invalidateQueries({
        queryKey: catalogoItemKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: catalogoItemKeys.detail(item.id),
      })
    },
  })
}

export function useDeleteCatalogoItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCatalogoItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: catalogoItemKeys.lists(),
      })
    },
  })
}
