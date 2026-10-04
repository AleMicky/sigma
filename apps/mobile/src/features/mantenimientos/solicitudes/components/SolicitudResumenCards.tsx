import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SolicitudMantenimientoResumen } from "../types/solicitud.types";

interface ResumenCardsProps {
    resumen?: SolicitudMantenimientoResumen;
    isLoading?: boolean;
    selectedEstado?: string;
    onSelectEstado?: (estado?: string) => void;
}

export function SolicitudResumenCards({
    resumen,
    isLoading = false,
    selectedEstado,
    onSelectEstado,
}: ResumenCardsProps) {
    if (isLoading || !resumen) {
        return null;
    }

    const items = [
        {
            label: "Total",
            estado: undefined,
            count: resumen.total ?? 0,
            dot: "bg-slate-900",
            activeBorder: "border-slate-900 bg-slate-900",
            activeText: "text-white",
        },
        {
            label: "En Revisión",
            estado: "EN_REVISION",
            count: resumen.enRevision ?? resumen.porRevisar ?? 0,
            dot: "bg-blue-500",
            activeBorder: "border-blue-600 bg-blue-600",
            activeText: "text-white",
        },
        {
            label: "En Proceso",
            estado: "EN_PROCESO",
            count: resumen.enProceso ?? resumen.enEjecucion ?? 0,
            dot: "bg-orange-500",
            activeBorder: "border-orange-600 bg-orange-600",
            activeText: "text-white",
        },
        {
            label: "Finalizadas",
            estado: "FINALIZADA",
            count: resumen.finalizadas ?? resumen.trabajoConcluido ?? 0,
            dot: "bg-emerald-500",
            activeBorder: "border-emerald-600 bg-emerald-600",
            activeText: "text-white",
        },
    ];

    return (
        <View className="py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {items.map((it) => {
                    const isSelected = selectedEstado === it.estado;

                    return (
                        <TouchableOpacity
                            key={it.label}
                            activeOpacity={0.7}
                            onPress={() => onSelectEstado?.(isSelected ? undefined : it.estado)}
                            className={`min-w-[105px] rounded-2xl p-3 border shadow-sm ${
                                isSelected
                                    ? it.activeBorder
                                    : "bg-white border-slate-200/90"
                            }`}
                        >
                            <View className="flex-row items-center gap-1.5">
                                <View
                                    className={`h-2 w-2 rounded-full ${
                                        isSelected ? "bg-white" : it.dot
                                    }`}
                                />
                                <Text
                                    className={`text-[11px] font-semibold ${
                                        isSelected ? "text-slate-200" : "text-slate-500"
                                    }`}
                                >
                                    {it.label}
                                </Text>
                            </View>
                            <Text
                                className={`text-xl font-extrabold mt-1 ${
                                    isSelected ? "text-white" : "text-slate-900"
                                }`}
                            >
                                {it.count}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
