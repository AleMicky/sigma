import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { solicitudService } from "../services/solicitud.service";
import {
    CreateSolicitudPayload,
    SolicitudMantenimientoFilters,
    UpdateSolicitudPayload,
} from "../types/solicitud.types";

export const solicitudKeys = {
    all: ["solicitudes-mantenimiento"] as const,
    lists: () => [...solicitudKeys.all, "list"] as const,
    list: (filters?: SolicitudMantenimientoFilters) =>
        [...solicitudKeys.lists(), filters ?? {}] as const,
    details: () => [...solicitudKeys.all, "detail"] as const,
    detail: (id: string) => [...solicitudKeys.details(), id] as const,
    resumen: (interfaz?: string) =>
        [...solicitudKeys.all, "resumen", interfaz] as const,
    trazabilidad: (id: string) =>
        [...solicitudKeys.all, "trazabilidad", id] as const,
    catalogos: {
        activos: (q?: string) => ["catalogos", "activos", q ?? ""] as const,
        tiposMantenimiento: () => ["catalogos", "tipos-mantenimiento"] as const,
        prioridades: () => ["catalogos", "prioridades"] as const,
        empleados: () => ["catalogos", "empleados"] as const,
    },
};

export function useSolicitudesQuery(filters?: SolicitudMantenimientoFilters) {
    return useQuery({
        queryKey: solicitudKeys.list(filters),
        queryFn: () => solicitudService.getSolicitudes(filters),
    });
}

export function useSolicitudDetailQuery(id: string) {
    return useQuery({
        queryKey: solicitudKeys.detail(id),
        queryFn: () => solicitudService.getSolicitud(id),
        enabled: Boolean(id),
    });
}

export function useSolicitudResumenQuery(interfaz?: string) {
    return useQuery({
        queryKey: solicitudKeys.resumen(interfaz),
        queryFn: () => solicitudService.getResumen(interfaz),
    });
}

export function useSolicitudTrazabilidadQuery(id: string) {
    return useQuery({
        queryKey: solicitudKeys.trazabilidad(id),
        queryFn: () => solicitudService.getTrazabilidad(id),
        enabled: Boolean(id),
    });
}

export function useActivosQuery(q?: string) {
    return useQuery({
        queryKey: solicitudKeys.catalogos.activos(q),
        queryFn: () => solicitudService.getActivos({ q, size: 50 }),
    });
}

export function useTiposMantenimientoQuery() {
    return useQuery({
        queryKey: solicitudKeys.catalogos.tiposMantenimiento(),
        queryFn: () => solicitudService.getTiposMantenimiento({ size: 50 }),
    });
}

export function usePrioridadesQuery() {
    return useQuery({
        queryKey: solicitudKeys.catalogos.prioridades(),
        queryFn: () => solicitudService.getPrioridades({ size: 50 }),
    });
}

export function useEmpleadosQuery() {
    return useQuery({
        queryKey: solicitudKeys.catalogos.empleados(),
        queryFn: () => solicitudService.getEmpleados({ size: 50 }),
    });
}

export function useCreateSolicitudMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSolicitudPayload) =>
            solicitudService.createSolicitud(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: solicitudKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: [...solicitudKeys.all, "resumen"],
            });
        },
    });
}

export function useUpdateSolicitudMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateSolicitudPayload;
        }) => solicitudService.updateSolicitud(id, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: solicitudKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: solicitudKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: [...solicitudKeys.all, "resumen"],
            });
        },
    });
}

export function useDeleteSolicitudMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => solicitudService.deleteSolicitud(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: solicitudKeys.lists() });
            queryClient.invalidateQueries({
                queryKey: [...solicitudKeys.all, "resumen"],
            });
        },
    });
}

