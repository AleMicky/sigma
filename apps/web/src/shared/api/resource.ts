import { http } from "./http"
import type { PageParams, PageResponse } from "@/shared/types/api.types"

export type ResourceEndpoints = {
  root: string
  byId: (id: string) => string
}

export function createResourceEndpoints(root: string): ResourceEndpoints {
  return {
    root,
    byId: (id: string) => `${root}/${id}`,
  }
}

export function createResourceKeys<TRoot extends string, TFilters = PageParams>(
  root: TRoot,
) {
  const all = [root] as const

  return {
    all,
    lists: () => [...all, "list"] as const,
    list: (filters?: TFilters) => [...all, "list", filters] as const,
    details: () => [...all, "detail"] as const,
    detail: (id: string) => [...all, "detail", id] as const,
  }
}

export type CrudService<TEntity, TPayload, TListParams = PageParams> = {
  list: (params?: TListParams) => Promise<PageResponse<TEntity>>
  get: (id: string) => Promise<TEntity>
  create: (payload: TPayload) => Promise<TEntity>
  update: (id: string, payload: TPayload) => Promise<TEntity>
  remove: (id: string) => Promise<void>
}

export function createCrudService<
  TEntity,
  TPayload,
  TListParams = PageParams,
>(endpoints: ResourceEndpoints): CrudService<TEntity, TPayload, TListParams> {
  return {
    list: (params) =>
      http.get<PageResponse<TEntity>>(endpoints.root, { params }),
    get: (id) => http.get<TEntity>(endpoints.byId(id)),
    create: (payload) =>
      http.post<TEntity, TPayload>(endpoints.root, payload),
    update: (id, payload) =>
      http.put<TEntity, TPayload>(endpoints.byId(id), payload),
    remove: async (id) => {
      await http.delete<void>(endpoints.byId(id))
    },
  }
}
