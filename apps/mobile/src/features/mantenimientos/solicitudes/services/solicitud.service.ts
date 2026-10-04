import { api } from "@/src/lib/api";
import { PageResponse } from "@/src/types/api.types";
import {
    CreateSolicitudPayload,
    SolicitudActivoInfo,
    SolicitudEmpleadoInfo,
    SolicitudMantenimiento,
    SolicitudMantenimientoFilters,
    SolicitudMantenimientoResumen,
    SolicitudMantenimientoTrazabilidad,
    SolicitudPrioridadInfo,
    SolicitudTipoMantenimientoInfo,
} from "../types/solicitud.types";

export const SOLICITUD_ENDPOINTS = {
    root: "/solicitudes-mantenimiento",
    detail: (id: string) => `/solicitudes-mantenimiento/${id}`,
    resumen: "/solicitudes-mantenimiento/resumen",
    trazabilidad: (id: string) => `/solicitudes-mantenimiento/${id}/trazabilidad`,
    activos: "/activos",
    tiposMantenimiento: "/tipos-mantenimiento",
    prioridades: "/prioridades",
    empleados: "/empleados/mis-empleados",
    todosEmpleados: "/empleados",
} as const;

export const solicitudService = {
    async getSolicitudes(
        filters?: SolicitudMantenimientoFilters
    ): Promise<PageResponse<SolicitudMantenimiento>> {
        const response = await api.get<PageResponse<SolicitudMantenimiento>>(
            SOLICITUD_ENDPOINTS.root,
            {
                params: filters,
            }
        );
        return response.data;
    },

    async getSolicitud(id: string): Promise<SolicitudMantenimiento> {
        const response = await api.get<SolicitudMantenimiento>(
            SOLICITUD_ENDPOINTS.detail(id)
        );
        return response.data;
    },

    async getResumen(interfaz?: string): Promise<SolicitudMantenimientoResumen> {
        const response = await api.get<SolicitudMantenimientoResumen>(
            SOLICITUD_ENDPOINTS.resumen,
            {
                params: interfaz ? { interfaz } : undefined,
            }
        );
        return response.data;
    },

    async getTrazabilidad(
        id: string
    ): Promise<SolicitudMantenimientoTrazabilidad[]> {
        const response = await api.get<SolicitudMantenimientoTrazabilidad[]>(
            SOLICITUD_ENDPOINTS.trazabilidad(id)
        );
        return response.data;
    },

    async createSolicitud(
        payload: CreateSolicitudPayload
    ): Promise<SolicitudMantenimiento> {
        // Sanitizar payload para asegurar compatibilidad con Spring Boot DTO
        const sanitizedPayload = {
            activoId: payload.activoId,
            tipoMantenimientoId: payload.tipoMantenimientoId,
            prioridadId: payload.prioridadId,
            solicitanteId: payload.solicitanteId,
            titulo: payload.titulo.trim(),
            descripcion: payload.descripcion.trim(),
            tipoFallas: payload.tipoFallas?.trim() || null,
        };

        const response = await api.post<SolicitudMantenimiento>(
            SOLICITUD_ENDPOINTS.root,
            sanitizedPayload
        );
        return response.data;
    },

    // --- Catálogos para el Formulario Completo ---
    async getActivos(params?: { q?: string; size?: number }): Promise<PageResponse<SolicitudActivoInfo>> {
        const response = await api.get<PageResponse<SolicitudActivoInfo>>(
            SOLICITUD_ENDPOINTS.activos,
            {
                params: {
                    size: params?.size ?? 100,
                    q: params?.q || undefined,
                    sortBy: "nombre",
                    direction: "ASC",
                },
            }
        );
        return response.data;
    },

    async getTiposMantenimiento(params?: { size?: number }): Promise<PageResponse<SolicitudTipoMantenimientoInfo>> {
        const response = await api.get<PageResponse<SolicitudTipoMantenimientoInfo>>(
            SOLICITUD_ENDPOINTS.tiposMantenimiento,
            {
                params: {
                    size: params?.size ?? 50,
                    sortBy: "nombre",
                    direction: "ASC",
                },
            }
        );
        return response.data;
    },

    async getPrioridades(params?: { size?: number }): Promise<PageResponse<SolicitudPrioridadInfo>> {
        const response = await api.get<PageResponse<SolicitudPrioridadInfo>>(
            SOLICITUD_ENDPOINTS.prioridades,
            {
                params: {
                    size: params?.size ?? 50,
                    sortBy: "nivel",
                    direction: "ASC",
                },
            }
        );
        return response.data;
    },

    async getEmpleados(params?: { q?: string; size?: number }): Promise<PageResponse<SolicitudEmpleadoInfo>> {
        try {
            const response = await api.get<PageResponse<any>>(
                SOLICITUD_ENDPOINTS.empleados,
                {
                    params: {
                        size: params?.size ?? 100,
                        q: params?.q || undefined,
                        sortBy: "codigo",
                        direction: "ASC",
                    },
                }
            );

            // Normalizar empleados
            const items: SolicitudEmpleadoInfo[] = (response.data?.content || []).map((emp: any) => ({
                id: emp.id,
                codigo: emp.codigo,
                nombreCompleto: emp.personaInfo?.nombreCompleto || emp.nombreCompleto || emp.personaNombreCompleto || emp.nombre || `Empleado ${emp.codigo || emp.id.substring(0, 6)}`,
                cargo: emp.cargoInfo?.nombre || emp.cargo || null,
            }));

            return {
                ...response.data,
                content: items,
            };
        } catch {
            const fallback = await api.get<PageResponse<any>>(
                SOLICITUD_ENDPOINTS.todosEmpleados,
                {
                    params: {
                        size: params?.size ?? 100,
                        q: params?.q || undefined,
                    },
                }
            );

            const items: SolicitudEmpleadoInfo[] = (fallback.data?.content || []).map((emp: any) => ({
                id: emp.id,
                codigo: emp.codigo,
                nombreCompleto: emp.personaInfo?.nombreCompleto || emp.nombreCompleto || emp.personaNombreCompleto || emp.nombre || `Empleado ${emp.codigo || emp.id.substring(0, 6)}`,
                cargo: emp.cargoInfo?.nombre || emp.cargo || null,
            }));

            return {
                ...fallback.data,
                content: items,
            };
        }
    },
};
