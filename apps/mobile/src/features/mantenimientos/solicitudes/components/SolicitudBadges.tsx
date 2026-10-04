import React from "react";
import { Text, View } from "react-native";

interface StatusBadgeProps {
    estado: string;
}

const STATUS_CONFIG: Record<
    string,
    { label: string; bg: string; text: string; dot: string; border: string }
> = {
    BORRADOR: {
        label: "Borrador",
        bg: "bg-slate-100",
        text: "text-slate-600",
        dot: "bg-slate-400",
        border: "border-slate-200",
    },
    EN_REVISION: {
        label: "En Revisión",
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
        border: "border-blue-200",
    },
    POR_REVISAR: {
        label: "Por Revisar",
        bg: "bg-blue-50",
        text: "text-blue-700",
        dot: "bg-blue-500",
        border: "border-blue-200",
    },
    POR_APROBAR: {
        label: "Por Aprobar",
        bg: "bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-500",
        border: "border-amber-200",
    },
    APROBADA: {
        label: "Aprobada",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
    },
    EN_PROCESO: {
        label: "En Proceso",
        bg: "bg-orange-50",
        text: "text-orange-700",
        dot: "bg-orange-500",
        border: "border-orange-200",
    },
    EN_EJECUCION: {
        label: "En Ejecución",
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        dot: "bg-indigo-500",
        border: "border-indigo-200",
    },
    OBSERVADA: {
        label: "Observada",
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-500",
        border: "border-rose-200",
    },
    FINALIZADA: {
        label: "Finalizada",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
    },
    TRABAJO_CONCLUIDO: {
        label: "Concluida",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
    },
    CANCELADA: {
        label: "Cancelada",
        bg: "bg-slate-100",
        text: "text-slate-500",
        dot: "bg-slate-400",
        border: "border-slate-200",
    },
    RECHAZADA: {
        label: "Rechazada",
        bg: "bg-rose-50",
        text: "text-rose-700",
        dot: "bg-rose-500",
        border: "border-rose-200",
    },
};

export function SolicitudStatusBadge({ estado }: StatusBadgeProps) {
    const normalizedKey = estado?.toUpperCase() || "BORRADOR";
    const config = STATUS_CONFIG[normalizedKey] || {
        label: estado || "Pendiente",
        bg: "bg-slate-100",
        text: "text-slate-600",
        dot: "bg-slate-400",
        border: "border-slate-200",
    };

    return (
        <View
            className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-0.5 border ${config.bg} ${config.border}`}
        >
            <View className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            <Text className={`text-[11px] font-bold ${config.text}`}>
                {config.label}
            </Text>
        </View>
    );
}

export function SolicitudPrioridadBadge({ prioridad }: { prioridad?: string }) {
    const p = prioridad?.toUpperCase() || "MEDIA";

    let style = {
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
    };

    if (p.includes("ALTA") || p.includes("URGENTE") || p.includes("CRITICA")) {
        style = {
            bg: "bg-rose-50",
            text: "text-rose-700",
            border: "border-rose-200",
        };
    } else if (p.includes("MEDIA")) {
        style = {
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
        };
    } else if (p.includes("BAJA")) {
        style = {
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            border: "border-emerald-200",
        };
    }

    return (
        <View className={`rounded-md px-2 py-0.5 border ${style.bg} ${style.border}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-tight ${style.text}`}>
                {prioridad || "Media"}
            </Text>
        </View>
    );
}

