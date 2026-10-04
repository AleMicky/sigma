import React from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    CalendarIcon,
    CpuIcon,
    UserIcon,
    WrenchIcon,
} from "@/src/components/icons";
import {
    ScreenHeader,
    StatusBadge,
} from "@/src/components/common";
import {
    useSolicitudDetailQuery,
    useSolicitudTrazabilidadQuery,
} from "../hooks/use-solicitudes";

function formatDate(dateStr?: string | null) {
    if (!dateStr) return "No asignado";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

export function SolicitudDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    const {
        data: solicitud,
        isLoading,
        isError,
        refetch,
    } = useSolicitudDetailQuery(id as string);

    const { data: trazabilidad = [] } = useSolicitudTrazabilidadQuery(
        id as string
    );

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-xs font-medium text-slate-500">
                    Cargando detalle de solicitud...
                </Text>
            </View>
        );
    }

    if (isError || !solicitud) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 px-6">
                <Text className="text-base font-bold text-slate-800">
                    No se pudo cargar la solicitud
                </Text>
                <TouchableOpacity
                    onPress={() => refetch()}
                    className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5"
                >
                    <Text className="text-xs font-bold text-white">Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-100">
            {/* Dark Theme Header */}
            <ScreenHeader
                theme="dark"
                title={solicitud.numero || "Detalle de Solicitud"}
                subtitle="Solicitud de Mantenimiento"
                rightNode={<StatusBadge status={solicitud.estado} />}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: Math.max(insets.bottom, 24) + 30,
                    gap: 14,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Title and General Overview */}
                <View className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-2xs">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Requerimiento
                        </Text>
                        <StatusBadge
                            status={solicitud.prioridad?.nombre}
                            label={`Prioridad: ${solicitud.prioridad?.nombre || "Normal"}`}
                        />
                    </View>

                    <Text className="text-xl font-bold text-slate-900 leading-tight">
                        {solicitud.titulo}
                    </Text>

                    <Text className="mt-3 text-sm text-slate-600 leading-relaxed">
                        {solicitud.descripcion || "Sin descripción detallada."}
                    </Text>
                </View>

                {/* Activo / Equipment Details */}
                {solicitud.activo && (
                    <View className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs">
                        <View className="flex-row items-center gap-2 mb-2.5">
                            <CpuIcon size={16} color="#2563eb" />
                            <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Activo / Equipo Asociado
                            </Text>
                        </View>

                        <View className="rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                            <Text className="text-xs font-mono font-bold text-blue-600">
                                {solicitud.activo.codigo}
                            </Text>
                            <Text className="text-sm font-bold text-slate-800 mt-0.5">
                                {solicitud.activo.nombre}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Maintenance Type & Priority */}
                <View className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs">
                    <View className="flex-row items-center gap-2 mb-2.5">
                        <WrenchIcon size={16} color="#ea580c" />
                        <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Tipo de Intervención
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                        <View>
                            <Text className="text-xs text-slate-500">
                                Clasificación
                            </Text>
                            <Text className="text-sm font-bold text-slate-800">
                                {solicitud.tipoMantenimiento?.nombre || "No especificado"}
                            </Text>
                        </View>

                        {solicitud.tipoFallas && (
                            <View className="items-end">
                                <Text className="text-xs text-slate-500">
                                    Falla reportada
                                </Text>
                                <Text className="text-xs font-semibold text-slate-700">
                                    {solicitud.tipoFallas}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Involved Personnel */}
                <View className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs gap-3">
                    <View className="flex-row items-center gap-2">
                        <UserIcon size={16} color="#4f46e5" />
                        <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Personal Involucrado
                        </Text>
                    </View>

                    {/* Solicitante */}
                    <View className="flex-row items-center justify-between py-1.5 border-b border-slate-100">
                        <Text className="text-xs text-slate-500">Solicitante</Text>
                        <Text className="text-xs font-bold text-slate-800">
                            {solicitud.solicitante?.nombreCompleto ||
                                solicitud.solicitante?.nombre ||
                                "N/A"}
                        </Text>
                    </View>

                    {/* Aprobador */}
                    {solicitud.aprobador && (
                        <View className="flex-row items-center justify-between py-1.5 border-b border-slate-100">
                            <Text className="text-xs text-slate-500">Aprobador</Text>
                            <Text className="text-xs font-bold text-slate-800">
                                {solicitud.aprobador.nombreCompleto ||
                                    solicitud.aprobador.nombre}
                            </Text>
                        </View>
                    )}

                    {/* Responsable */}
                    {solicitud.responsable && (
                        <View className="flex-row items-center justify-between py-1.5 border-b border-slate-100">
                            <Text className="text-xs text-slate-500">Responsable</Text>
                            <Text className="text-xs font-bold text-slate-800">
                                {solicitud.responsable.nombreCompleto ||
                                    solicitud.responsable.nombre}
                            </Text>
                        </View>
                    )}

                    {/* Supervisor */}
                    {solicitud.supervisor && (
                        <View className="flex-row items-center justify-between py-1.5">
                            <Text className="text-xs text-slate-500">Supervisor</Text>
                            <Text className="text-xs font-bold text-slate-800">
                                {solicitud.supervisor.nombreCompleto ||
                                    solicitud.supervisor.nombre}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Dates & Timeline */}
                <View className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs gap-2.5">
                    <View className="flex-row items-center gap-2 mb-1">
                        <CalendarIcon size={16} color="#059669" />
                        <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Fechas Clave
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between py-1 border-b border-slate-100">
                        <Text className="text-xs text-slate-500">Fecha Solicitud</Text>
                        <Text className="text-xs font-semibold text-slate-700">
                            {formatDate(solicitud.fechaSolicitud)}
                        </Text>
                    </View>

                    {solicitud.fechaInicioMantenimiento && (
                        <View className="flex-row items-center justify-between py-1 border-b border-slate-100">
                            <Text className="text-xs text-slate-500">Fecha Inicio</Text>
                            <Text className="text-xs font-semibold text-slate-700">
                                {formatDate(solicitud.fechaInicioMantenimiento)}
                            </Text>
                        </View>
                    )}

                    {solicitud.fechaFinMantenimiento && (
                        <View className="flex-row items-center justify-between py-1">
                            <Text className="text-xs text-slate-500">Fecha Fin</Text>
                            <Text className="text-xs font-semibold text-slate-700">
                                {formatDate(solicitud.fechaFinMantenimiento)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Traceability History */}
                {trazabilidad.length > 0 && (
                    <View className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-2xs">
                        <Text className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                            Historial de Trazabilidad ({trazabilidad.length})
                        </Text>

                        <View className="gap-2.5">
                            {trazabilidad.map((item, idx) => (
                                <View
                                    key={item.id || idx}
                                    className="rounded-xl bg-slate-50 p-3 border border-slate-200/60"
                                >
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-xs font-bold text-slate-800">
                                            {item.estadoNuevo}
                                        </Text>
                                        <Text className="text-[10px] text-slate-400">
                                            {formatDate(item.fecha)}
                                        </Text>
                                    </View>
                                    {item.comentario && (
                                        <Text className="text-xs text-slate-600 mt-0.5">
                                            {item.comentario}
                                        </Text>
                                    )}
                                    {item.empleado && (
                                        <Text className="text-[10px] font-medium text-slate-400 mt-1">
                                            Por: {item.empleado.nombreCompleto || item.empleado.nombre}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
