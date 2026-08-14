import { createCrudService, http } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { ubicacionEndpoints } from "./ubicacion.endpoints"

export type TipoUbicacion =
  | "PAIS"
  | "DEPARTAMENTO"
  | "CIUDAD"
  | "SUCURSAL"
  | "EDIFICIO"
  | "PLANTA"
  | "AREA"
  | "OFICINA"
  | "ALMACEN"
  | "TALLER"
  | "OTRO"

export type Ubicacion = AuditableEntity & {
  codigo: string
  nombre: string
  descripcion: string | null
  tipo: TipoUbicacion
  ubicacionPadreId: string | null
  direccion: string | null
  latitud: number | null
  longitud: number | null
}

export type UbicacionPayload = {
  codigo: string
  nombre: string
  descripcion?: string | null
  tipo: TipoUbicacion
  ubicacionPadreId?: string | null
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
}

export type UbicacionTreeNode = {
  id: string
  codigo: string
  nombre: string
  tipo: TipoUbicacion
  ubicacionPadreId: string | null
  hijos: UbicacionTreeNode[]
}

const crud = createCrudService<Ubicacion, UbicacionPayload>(ubicacionEndpoints)

export const listUbicaciones = crud.list
export const getUbicacion = crud.get
export const createUbicacion = crud.create
export const updateUbicacion = crud.update
export const deleteUbicacion = crud.remove

export const getUbicacionesRaices = (): Promise<Ubicacion[]> =>
  http.get<Ubicacion[]>(ubicacionEndpoints.raices)

export const getUbicacionesArbol = (): Promise<UbicacionTreeNode[]> =>
  http.get<UbicacionTreeNode[]>(ubicacionEndpoints.arbol)

export const getUbicacionHijos = (id: string): Promise<Ubicacion[]> =>
  http.get<Ubicacion[]>(ubicacionEndpoints.hijos(id))

export const getUbicacionSubArbol = (id: string): Promise<UbicacionTreeNode> =>
  http.get<UbicacionTreeNode>(ubicacionEndpoints.subArbol(id))
