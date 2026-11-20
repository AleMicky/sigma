import type { PageParams } from "@/shared/types/api.types"

export type VehiculoAtributo = {
  atributoId: string
  codigo: string
  etiqueta: string
  tipoDatoCodigo: string
  orden: number
  visible: boolean
  valor: string | null
  valorFormateado: string | null
}

export type VehiculoTipoActivoInfo = {
  id: string
  nombre: string
  color: string | null
  icono: string | null
}

export type VehiculoUbicacionInfo = {
  id: string
  codigo: string
  nombre: string
}

export type VehiculoEstadoOperativoInfo = {
  id: string
  codigo: string
  nombre: string
  color: string | null
}

export type VehiculoFlotaInfo = {
  id: string
  codigo: string
  nombre: string
}

export type VehiculoCatalogo = {
  id: string
  codigo: string
  codigoAlternativo: string | null
  nombre: string
  descripcion: string | null
  fechaAdquisicion: string | null
  urlImagen: string | null
  activo: boolean
  tipoActivo: VehiculoTipoActivoInfo | null
  ubicacion: VehiculoUbicacionInfo | null
  estadoOperativo: VehiculoEstadoOperativoInfo | null
  flotas: VehiculoFlotaInfo[]
  atributos: VehiculoAtributo[]
}

export type VehiculoCatalogoFilters = PageParams & {
  q?: string
  estadoOperativoId?: string
  ubicacionId?: string
  flotaId?: string
  activo?: boolean
}
