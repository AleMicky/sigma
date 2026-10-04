import { PageParams } from "@/src/types/api.types";

export interface SolicitudActivoInfo {
    id: string;
    codigo: string;
    nombre: string;
}

export interface SolicitudTipoMantenimientoInfo {
    id: string;
    codigo: string;
    nombre: string;
}

export interface SolicitudPrioridadInfo {
    id: string;
    codigo: string;
    nombre: string;
    nivel: number;
}

export interface SolicitudEmpleadoInfo {
    id: string;
    codigo?: string;
    nombreCompleto: string;
    nombre?: string;
    cargo?: string | null;
}

export interface SolicitudAdjunto {
    id: string;
    nombreArchivo: string;
    url: string;
    tipoContenido: string;
    size: number;
    descripcion?: string | null;
}

export interface SolicitudMantenimiento {
    id: string;
    numero: string;
    activo: SolicitudActivoInfo;
    tipoMantenimiento: SolicitudTipoMantenimientoInfo;
    tipoFallas?: string | null;
    prioridad: SolicitudPrioridadInfo;
    solicitante: SolicitudEmpleadoInfo;
    titulo: string;
    descripcion: string;
    fechaSolicitud: string;
    aprobador?: SolicitudEmpleadoInfo | null;
    responsable?: SolicitudEmpleadoInfo | null;
    supervisor?: SolicitudEmpleadoInfo | null;
    fechaInicioMantenimiento?: string | null;
    fechaFinMantenimiento?: string | null;
    fechaCierre?: string | null;
    processInstanceId?: string | null;
    estado: string;
    adjuntos: SolicitudAdjunto[];
}

export interface SolicitudMantenimientoFilters extends PageParams {
    q?: string;
    estado?: string;
    solicitanteId?: string;
    interfaz?: string;
}

export interface SolicitudMantenimientoResumen {
    total: number;
    borradores: number;
    enRevision: number;
    enProceso: number;
    finalizadas: number;
    porAprobar?: number;
    observadas?: number;
    asignadas?: number;
    porIniciar?: number;
    enEjecucion?: number;
    porRevisar?: number;
    validadas?: number;
    trabajoConcluido?: number;
}

export interface SolicitudMantenimientoTrazabilidad {
    id: string;
    solicitudMantenimientoId: string;
    estadoAnterior?: string | null;
    estadoNuevo: string;
    comentario?: string | null;
    empleadoId?: string | null;
    empleado?: SolicitudEmpleadoInfo | null;
    fecha: string;
}

export interface CreateSolicitudPayload {
    activoId: string;
    tipoMantenimientoId: string;
    tipoFallas?: string | null;
    prioridadId: string;
    solicitanteId: string;
    titulo: string;
    descripcion: string;
    fechaSolicitud?: string | null;
}
