import { createCrudMutations } from "@/shared/api"

import { cargoKeys } from "./cargo.keys"
import {
  createCargo,
  deleteCargo,
  updateCargo,
  type Cargo,
  type CargoPayload,
} from "./cargo.service"

const cargoMutations = createCrudMutations<Cargo, CargoPayload>({
  keys: cargoKeys,
  service: {
    create: createCargo,
    update: updateCargo,
    remove: deleteCargo,
  },
  messages: {
    created: "Cargo creado correctamente",
    updated: "Cargo actualizado correctamente",
    deleted: "Cargo eliminado correctamente",
  },
})

export const useCreateCargo = cargoMutations.useCreate
export const useUpdateCargo = cargoMutations.useUpdate
export const useDeleteCargo = cargoMutations.useDelete
