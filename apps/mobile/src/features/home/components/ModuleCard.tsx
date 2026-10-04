import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ModuleItem, SubmenuItem } from "../data/menu-modules";
import {
    ChevronDownIcon,
    ChevronRightIcon,
    PlusIcon,
} from "@/src/components/icons";

interface ModuleCardProps {
    module: ModuleItem;
    isDefaultExpanded?: boolean;
}

export function ModuleCard({ module, isDefaultExpanded = true }: ModuleCardProps) {
    const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
    const Icon = module.icon;

    const handleSubmenuPress = (item: SubmenuItem) => {
        if (item.route) {
            router.push(item.route as any);
        } else {
            Alert.alert(
                item.title,
                `${item.description || "Opción seleccionada"}.\n\n(Este submódulo estará disponible próximamente en la aplicación móvil)`
            );
        }
    };

    const handleNewRequestPress = (e: any) => {
        e.stopPropagation?.();
        router.push("/(app)/mantenimientos/solicitudes/nueva" as any);
    };

    return (
        <View className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-2xs mb-4">
            {/* Main Module Card Header */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsExpanded((prev) => !prev)}
                className="p-4 flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                    {/* Icon Container with Custom Accent */}
                    <View
                        style={{ backgroundColor: `${module.accentColor}15` }}
                        className="h-12 w-12 items-center justify-center rounded-2xl border border-orange-200/50 shadow-2xs"
                    >
                        <Icon size={24} color={module.accentColor} />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-base font-bold text-slate-900">
                                {module.title}
                            </Text>
                            <View className="rounded-full bg-orange-100/80 px-2 py-0.5">
                                <Text className="text-[10px] font-bold text-orange-800">
                                    {module.tag}
                                </Text>
                            </View>
                        </View>
                        <Text
                            numberOfLines={2}
                            className="text-xs text-slate-500 mt-0.5 leading-relaxed"
                        >
                            {module.description}
                        </Text>
                    </View>
                </View>

                {/* Expand / Collapse Indicator */}
                <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-100/80 border border-slate-200/60 shadow-2xs">
                    {isExpanded ? (
                        <ChevronDownIcon size={16} color="#475569" />
                    ) : (
                        <ChevronRightIcon size={16} color="#475569" />
                    )}
                </View>
            </TouchableOpacity>

            {/* Submenu Items */}
            {isExpanded && (
                <View className="border-t border-slate-100 bg-slate-50/70 p-3 gap-2">
                    {module.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isPrimaryModule = subItem.isAvailable;

                        return (
                            <TouchableOpacity
                                key={subItem.id}
                                activeOpacity={0.75}
                                onPress={() => handleSubmenuPress(subItem)}
                                className={`rounded-xl p-3 border shadow-2xs ${
                                    isPrimaryModule
                                        ? "bg-white border-blue-200/80 active:bg-blue-50/40"
                                        : "bg-white/80 border-slate-200/60 active:bg-slate-100"
                                }`}
                            >
                                <View className="flex-row items-center gap-3">
                                    {SubIcon && (
                                        <View
                                            className={`h-9 w-9 items-center justify-center rounded-xl ${
                                                isPrimaryModule
                                                    ? "bg-blue-50 border border-blue-100"
                                                    : "bg-slate-100 border border-slate-200/60"
                                            }`}
                                        >
                                            <SubIcon
                                                size={18}
                                                color={
                                                    isPrimaryModule
                                                        ? "#2563eb"
                                                        : "#64748b"
                                                }
                                            />
                                        </View>
                                    )}

                                    <View className="flex-1 pr-1">
                                        <View className="flex-row items-center gap-2">
                                            <Text
                                                className={`text-xs font-bold ${
                                                    isPrimaryModule
                                                        ? "text-slate-900"
                                                        : "text-slate-700"
                                                }`}
                                            >
                                                {subItem.title}
                                            </Text>
                                            {subItem.badge && (
                                                <View
                                                    className={`rounded-full px-2 py-0.5 ${
                                                        subItem.badge === "Disponible"
                                                            ? "bg-emerald-50 border border-emerald-200"
                                                            : "bg-slate-100 border border-slate-200"
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-[9px] font-bold ${
                                                            subItem.badge === "Disponible"
                                                                ? "text-emerald-700"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        {subItem.badge}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {subItem.description && (
                                            <Text
                                                numberOfLines={2}
                                                className="text-[11px] text-slate-500 mt-0.5 leading-snug"
                                            >
                                                {subItem.description}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Quick CTA button for available items */}
                                    {isPrimaryModule ? (
                                        <View className="flex-row items-center gap-1.5">
                                            <TouchableOpacity
                                                activeOpacity={0.75}
                                                onPress={handleNewRequestPress}
                                                className="flex-row items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 shadow-2xs active:bg-blue-700"
                                            >
                                                <PlusIcon size={12} color="#ffffff" />
                                                <Text className="text-[11px] font-bold text-white">
                                                    Nueva
                                                </Text>
                                            </TouchableOpacity>

                                            <View className="h-7 w-7 items-center justify-center rounded-lg bg-slate-50">
                                                <ChevronRightIcon size={14} color="#64748b" />
                                            </View>
                                        </View>
                                    ) : (
                                        <View className="h-7 w-7 items-center justify-center">
                                            <ChevronRightIcon size={14} color="#cbd5e1" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
}
