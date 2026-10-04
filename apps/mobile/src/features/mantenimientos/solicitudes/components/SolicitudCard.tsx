import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import {
    BoxesIcon,
    CalendarIcon,
    PencilIcon,
    TrashIcon,
} from "@/src/components/icons";
import {
    SolicitudPrioridadBadge,
    SolicitudStatusBadge,
} from "./SolicitudBadges";
import { SolicitudMantenimiento } from "../types/solicitud.types";

interface SolicitudCardProps {
    solicitud: SolicitudMantenimiento;
    onEdit?: (solicitud: SolicitudMantenimiento) => void;
    onDelete?: (solicitud: SolicitudMantenimiento) => void;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "Reciente";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("es-BO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function getInitials(name?: string) {
    if (!name) return "S";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export function SolicitudCard({
    solicitud,
    onEdit,
    onDelete,
}: SolicitudCardProps) {
    const handlePress = () => {
        router.push({
            pathname: "/(app)/mantenimientos/solicitudes/[id]",
            params: { id: solicitud.id },
        });
    };

    const handleEditPress = () => {
        if (onEdit) {
            onEdit(solicitud);
        } else {
            router.push({
                pathname: "/(app)/mantenimientos/solicitudes/editar",
                params: { id: solicitud.id },
            });
        }
    };

    const handleDeletePress = () => {
        if (onDelete) {
            onDelete(solicitud);
        }
    };

    const solicitanteNombre =
        solicitud.solicitante?.nombreCompleto ||
        solicitud.solicitante?.nombre ||
        "Solicitante";

    const codigo =
        solicitud.numero ||
        (solicitud.id ? `#${solicitud.id.slice(0, 6).toUpperCase()}` : "#---");

    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={handlePress}
            className="mb-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-2xs active:bg-slate-50"
        >
            {/* Header: Código + Prioridad + Estado */}
            <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-center gap-2 flex-wrap">
                    <View className="rounded-lg bg-slate-100 px-2 py-0.5 border border-slate-200/80">
                        <Text className="text-[11px] font-mono font-bold text-slate-800 tracking-tight">
                            {codigo.startsWith("#") ? codigo : `#${codigo}`}
                        </Text>
                    </View>
                    <SolicitudPrioridadBadge
                        prioridad={solicitud.prioridad?.nombre}
                    />
                </View>

                <SolicitudStatusBadge estado={solicitud.estado} />
            </View>

            {/* Titulo */}
            <View className="mt-2.5">
                <Text
                    numberOfLines={2}
                    className="text-[15px] font-bold text-slate-900 leading-snug"
                >
                    {solicitud.titulo}
                </Text>

                {solicitud.descripcion ? (
                    <Text
                        numberOfLines={2}
                        className="mt-1 text-xs text-slate-500 leading-relaxed"
                    >
                        {solicitud.descripcion}
                    </Text>
                ) : null}
            </View>

            {/* Activo / Equipo Asociado */}
            {solicitud.activo && (
                <View className="mt-3 flex-row items-center gap-1.5 self-start rounded-xl bg-slate-100 px-2.5 py-1 border border-slate-200/70">
                    <BoxesIcon size={13} color="#475569" />
                    <Text numberOfLines={1} className="text-[11px] font-semibold text-slate-700 max-w-[260px]">
                        {solicitud.activo.codigo ? `${solicitud.activo.codigo} • ` : ""}
                        {solicitud.activo.nombre}
                    </Text>
                </View>
            )}

            {/* Footer: Solicitante, Fecha y Acciones */}
            <View className="mt-3.5 pt-2.5 border-t border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                        <Text className="text-[10px] font-extrabold text-blue-700">
                            {getInitials(solicitanteNombre)}
                        </Text>
                    </View>
                    <Text numberOfLines={1} className="text-xs font-medium text-slate-600 flex-1">
                        {solicitanteNombre}
                    </Text>
                </View>

                <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1 mr-1">
                        <CalendarIcon size={12} color="#94a3b8" />
                        <Text className="text-[11px] font-medium text-slate-400">
                            {formatDate(solicitud.fechaSolicitud)}
                        </Text>
                    </View>

                    {/* Botón Editar */}
                    <TouchableOpacity
                        onPress={handleEditPress}
                        activeOpacity={0.7}
                        className="h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 active:bg-blue-100"
                        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                    >
                        <PencilIcon size={13} color="#2563eb" />
                    </TouchableOpacity>

                    {/* Botón Eliminar (solo si onDelete disponible) */}
                    {onDelete && (
                        <TouchableOpacity
                            onPress={handleDeletePress}
                            activeOpacity={0.7}
                            className="h-7 w-7 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 active:bg-rose-100"
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}
                        >
                            <TrashIcon size={13} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}


