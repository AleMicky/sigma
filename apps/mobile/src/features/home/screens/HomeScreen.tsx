import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRightIcon } from "@/src/components/icons";
import {
    HomeHeader,
    ModuleCard,
    QuickActions,
    SearchSection,
} from "../components";
import { ModuleItem, SYSTEM_MODULES } from "../data/menu-modules";

export function HomeScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter modules and subitems by search query
    const filteredModules = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return SYSTEM_MODULES;

        return SYSTEM_MODULES.map((module) => {
            const matchesModule =
                module.title.toLowerCase().includes(query) ||
                module.description.toLowerCase().includes(query);

            const matchingItems = module.items.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    (item.description &&
                        item.description.toLowerCase().includes(query))
            );

            if (matchesModule || matchingItems.length > 0) {
                return {
                    ...module,
                    items: matchesModule ? module.items : matchingItems,
                };
            }
            return null;
        }).filter(Boolean) as ModuleItem[];
    }, [searchQuery]);

    return (
        <View className="flex-1 bg-slate-100">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: Math.max(insets.bottom, 24) + 20,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Modern App Header */}
                <HomeHeader />

                {/* Instant Search Bar */}
                <SearchSection
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Quick Shortcuts (Only shown when not searching) */}
                {!searchQuery && <QuickActions />}

                {/* System Modules & Menu Section */}
                <View className="px-5 pt-6">
                    <View className="flex-row items-center justify-between mb-3.5">
                        <View>
                            <Text className="text-base font-bold text-slate-900 tracking-tight">
                                Módulos del Sistema
                            </Text>
                            <Text className="text-xs text-slate-500 mt-0.5">
                                Selecciona una sección para ver las opciones disponibles
                            </Text>
                        </View>
                        <View className="rounded-full bg-slate-200/80 px-2.5 py-1">
                            <Text className="text-[11px] font-bold text-slate-700">
                                {filteredModules.length} módulos
                            </Text>
                        </View>
                    </View>

                    {filteredModules.length === 0 ? (
                        <View className="rounded-2xl bg-white p-8 items-center justify-center border border-slate-200/80 my-2">
                            <Text className="text-sm font-bold text-slate-700">
                                No se encontraron resultados
                            </Text>
                            <Text className="text-xs text-slate-400 text-center mt-1">
                                Intenta buscar con otros términos como &ldquo;orden&rdquo;, &ldquo;activo&rdquo; o &ldquo;viaje&rdquo;.
                            </Text>
                            <TouchableOpacity
                                onPress={() => setSearchQuery("")}
                                className="mt-4 rounded-xl bg-blue-50 px-4 py-2"
                            >
                                <Text className="text-xs font-semibold text-blue-600">
                                    Restablecer búsqueda
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredModules.map((module, index) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                isDefaultExpanded={index === 0 || searchQuery.length > 0}
                            />
                        ))
                    )}
                </View>

                {/* Server Status Footer */}
                <View className="mx-5 mt-4 rounded-2xl bg-white p-4 border border-slate-200/80 flex-row items-center justify-between shadow-xs">
                    <View className="flex-row items-center gap-2.5">
                        <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <View>
                            <Text className="text-xs font-bold text-slate-800">
                                Sistema Conectado
                            </Text>
                            <Text className="text-[10px] font-mono text-slate-500">
                                SIGMA Mobile • v1.0.0
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/server-config")}
                        className="flex-row items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200/60"
                    >
                        <Text className="text-xs font-semibold text-slate-700">
                            Servidor
                        </Text>
                        <ChevronRightIcon size={13} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
