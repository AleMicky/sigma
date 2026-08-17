import { createCrudService } from "@/shared/api"
import type { AuditableEntity } from "@/shared/types/audit.types"

import { solicitudEndpoints } from "./solicitud.endpoints"

export type SolicitudMantenimiento = AuditableEntity & {
  numero: string
  activoId: string
  tipoMantenimientoId: string
  motivoMantenimientoId: string | null
  prioridadId: string
  solicitanteId: string
  areaSolicitanteId: string
  titulo: string
  descripcion: string | null
  fechaSolicitud: string
  estado: string
}

export type SolicitudPayload = {
  activoId: string
  tipoMantenimientoId: string
  motivoMantenimientoId?: string | null
  prioridadId: string
  solicitanteId: string
  areaSolicitanteId: string
  titulo: string
  descripcion?: string | null
}

const crud = createCrudService<SolicitudMantenimiento, SolicitudPayload>(solicitudEndpoints)

export const listSolicitudes = crud.list
export const getSolicitud = crud.get
export const createSolicitud = crud.create
export const updateSolicitud = crud.update
export const deleteSolicitud = crud.remove
