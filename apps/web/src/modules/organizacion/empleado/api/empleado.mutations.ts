import { createCrudMutations } from "@/shared/api"

import { empleadoKeys } from "./empleado.keys"
import {
  createEmpleado,
  deleteEmpleado,
  updateEmpleado,
  type Empleado,
  type EmpleadoPayload,
} from "./empleado.service"

const empleadoMutations = createCrudMutations<Empleado, EmpleadoPayload>({
  keys: empleadoKeys,
  service: {
    create: createEmpleado,
    update: updateEmpleado,
    remove: deleteEmpleado,
  },
  messages: {
    created: "Empleado registrado correctamente",
    updated: "Empleado actualizado correctamente",
    deleted: "Empleado eliminado correctamente",
  },
})

export const useCreateEmpleado = empleadoMutations.useCreate
export const useUpdateEmpleado = empleadoMutations.useUpdate
export const useDeleteEmpleado = empleadoMutations.useDelete
