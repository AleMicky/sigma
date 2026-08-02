import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { getErrorMessage } from "./errors"

type EntityWithId = {
  id: string
}

type CrudMutationMessages = {
  created: string
  updated: string
  deleted: string
}

type CrudMutationKeys = {
  all: QueryKey
  lists: () => QueryKey
  detail: (id: string) => QueryKey
}

type CrudMutationService<TEntity, TPayload> = {
  create: (payload: TPayload) => Promise<TEntity>
  update: (id: string, payload: TPayload) => Promise<TEntity>
  remove: (id: string) => Promise<void>
}

type CreateCrudMutationsOptions<TEntity extends EntityWithId, TPayload> = {
  keys: CrudMutationKeys
  service: CrudMutationService<TEntity, TPayload>
  messages: CrudMutationMessages
  /** Extra query keys to invalidate after any mutation succeeds. */
  invalidateKeys?: QueryKey[]
}

export function createCrudMutations<
  TEntity extends EntityWithId,
  TPayload,
>({
  keys,
  service,
  messages,
  invalidateKeys = [],
}: CreateCrudMutationsOptions<TEntity, TPayload>) {
  function useInvalidate() {
    const queryClient = useQueryClient()

    return (extra?: QueryKey[]) => {
      void queryClient.invalidateQueries({ queryKey: keys.lists() })
      for (const key of [...invalidateKeys, ...(extra ?? [])]) {
        void queryClient.invalidateQueries({ queryKey: key })
      }
    }
  }

  function useCreate() {
    const invalidate = useInvalidate()

    return useMutation({
      mutationFn: service.create,
      onSuccess: () => {
        invalidate()
        toast.success(messages.created)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  function useUpdate() {
    const invalidate = useInvalidate()

    return useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: string
        payload: TPayload
      }) => service.update(id, payload),
      onSuccess: (entity) => {
        invalidate([keys.detail(entity.id)])
        toast.success(messages.updated)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  function useDelete() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: service.remove,
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: keys.all })
        for (const key of invalidateKeys) {
          void queryClient.invalidateQueries({ queryKey: key })
        }
        toast.success(messages.deleted)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  return {
    useCreate,
    useUpdate,
    useDelete,
  }
}
