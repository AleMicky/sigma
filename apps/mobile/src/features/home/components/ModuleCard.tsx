import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ModuleItem, SubmenuItem } from "../data/menu-modules";
import { ChevronDownIcon, ChevronRightIcon } from "@/src/components/icons";

interface ModuleCardProps {
    module: ModuleItem;
    isDefaultExpanded?: boolean;
}

export function ModuleCard({ module, isDefaultExpanded = false }: ModuleCardProps) {
    const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);
    const Icon = module.icon;

    const handleSubmenuPress = (item: SubmenuItem) => {
        if (item.route) {
            router.push(item.route as any);
        } else {
            Alert.alert(
                item.title,
                `${item.description || "Opción seleccionada"}.\n\n(Módulo disponible en la plataforma SIGMA)`
            );
        }
    };

    return (
        <View className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs mb-3.5">
            {/* Main Module Card Header */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsExpanded((prev) => !prev)}
                className="p-4 flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-3.5 flex-1 pr-2">
                    {/* Icon Container with Custom Accent */}
                    <View
                        style={{ backgroundColor: `${module.accentColor}18` }}
                        className="h-12 w-12 items-center justify-center rounded-2xl border border-slate-100"
                    >
                        <Icon size={24} color={module.accentColor} />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-base font-bold text-slate-900">
                                {module.title}
                            </Text>
                            <View className="rounded-full bg-slate-100 px-2 py-0.5">
                                <Text className="text-[10px] font-semibold text-slate-600">
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
                <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-200/60">
                    {isExpanded ? (
                        <ChevronDownIcon size={16} color="#64748b" />
                    ) : (
                        <ChevronRightIcon size={16} color="#64748b" />
                    )}
                </View>
            </TouchableOpacity>

            {/* Submenu Accordion Items */}
            {isExpanded && (
                <View className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 gap-1.5">
                    {module.items.map((subItem) => (
                        <TouchableOpacity
                            key={subItem.id}
                            activeOpacity={0.7}
                            onPress={() => handleSubmenuPress(subItem)}
                            className="flex-row items-center justify-between rounded-xl bg-white p-3 border border-slate-200/60 active:bg-blue-50/50"
                        >
                            <View className="flex-1 pr-2">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-xs font-bold text-slate-800">
                                        {subItem.title}
                                    </Text>
                                    {subItem.badge && (
                                        <View className="rounded bg-orange-100 px-1.5 py-0.5">
                                            <Text className="text-[9px] font-bold text-orange-700">
                                                {subItem.badge}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                {subItem.description && (
                                    <Text className="text-[11px] text-slate-500 mt-0.5">
                                        {subItem.description}
                                    </Text>
                                )}
                            </View>

                            <View className="h-6 w-6 items-center justify-center">
                                <ChevronRightIcon size={14} color="#94a3b8" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
