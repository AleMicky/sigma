import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export interface FilterCounts {
    total?: number;
    enRevision?: number;
    enProceso?: number;
    finalizadas?: number;
    borradores?: number;
}

interface FilterTabsProps {
    selectedEstado?: string;
    onSelectEstado: (estado?: string) => void;
    counts?: FilterCounts;
}

const TABS: { label: string; value?: string; countKey?: keyof FilterCounts }[] = [
    { label: "Todas", value: undefined, countKey: "total" },
    { label: "En Revisión", value: "EN_REVISION", countKey: "enRevision" },
    { label: "En Proceso", value: "EN_PROCESO", countKey: "enProceso" },
    { label: "Borradores", value: "BORRADOR", countKey: "borradores" },
    { label: "Finalizadas", value: "FINALIZADA", countKey: "finalizadas" },
];

export function SolicitudFilterTabs({
    selectedEstado,
    onSelectEstado,
    counts,
}: FilterTabsProps) {
    return (
        <View className="py-2.5">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 8,
                }}
            >
                {TABS.map((tab) => {
                    const isSelected = selectedEstado === tab.value;
                    const count = tab.countKey && counts ? counts[tab.countKey] : undefined;

                    return (
                        <TouchableOpacity
                            key={tab.label}
                            onPress={() => {
                                // Si ya está seleccionado y no es 'Todas', deseleccionar (ir a undefined/Todas)
                                if (isSelected && tab.value !== undefined) {
                                    onSelectEstado(undefined);
                                } else {
                                    onSelectEstado(tab.value);
                                }
                            }}
                            activeOpacity={0.75}
                            className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-2 border shadow-2xs ${
                                isSelected
                                    ? "bg-slate-900 border-slate-900"
                                    : "bg-white border-slate-200/90 active:bg-slate-50"
                            }`}
                        >
                            <Text
                                className={`text-xs font-bold ${
                                    isSelected
                                        ? "text-white"
                                        : "text-slate-700"
                                }`}
                            >
                                {tab.label}
                            </Text>

                            {typeof count === "number" && count > 0 && (
                                <View
                                    className={`rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center ${
                                        isSelected
                                            ? "bg-slate-700"
                                            : "bg-slate-100"
                                    }`}
                                >
                                    <Text
                                        className={`text-[10px] font-bold ${
                                            isSelected
                                                ? "text-white"
                                                : "text-slate-600"
                                        }`}
                                    >
                                        {count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

