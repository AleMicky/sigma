import { createCrudMutations } from "@/shared/api"

import { grupoAprobadorKeys } from "./grupo-aprobador.keys"
import {
  createGrupoAprobador,
  deleteGrupoAprobador,
  updateGrupoAprobador,
  type GrupoAprobador,
  type GrupoAprobadorPayload,
} from "./grupo-aprobador.service"

const grupoAprobadorMutations = createCrudMutations<
  GrupoAprobador,
  GrupoAprobadorPayload
>({
  keys: grupoAprobadorKeys,
  service: {
    create: createGrupoAprobador,
    update: updateGrupoAprobador,
    remove: deleteGrupoAprobador,
  },
  messages: {
    created: "Grupo aprobador creado correctamente",
    updated: "Grupo aprobador actualizado correctamente",
    deleted: "Grupo aprobador eliminado correctamente",
  },
})

export const useCreateGrupoAprobador = grupoAprobadorMutations.useCreate
export const useUpdateGrupoAprobador = grupoAprobadorMutations.useUpdate
export const useDeleteGrupoAprobador = grupoAprobadorMutations.useDelete
