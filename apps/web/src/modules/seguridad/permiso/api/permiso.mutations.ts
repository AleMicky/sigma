import { createCrudMutations } from "@/shared/api"

import { permisoKeys } from "./permiso.keys"
import {
  createPermiso,
  deletePermiso,
  updatePermiso,
  type CreatePermisoDto,
  type Permiso,
} from "./permiso.service"

const permisoMutations = createCrudMutations<Permiso, CreatePermisoDto>({
  keys: permisoKeys,
  service: {
    create: createPermiso,
    update: updatePermiso,
    remove: deletePermiso,
  },
  messages: {
    created: "Permiso creado correctamente",
    updated: "Permiso actualizado correctamente",
    deleted: "Permiso eliminado correctamente",
  },
  invalidateKeys: [
    permisoKeys.all,
    permisoKeys.allList(),
  ],
})

export const useCreatePermiso = permisoMutations.useCreate
export const useUpdatePermiso = permisoMutations.useUpdate
export const useDeletePermiso = permisoMutations.useDelete
