import { useMemo, useState } from "react";
import {
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

    // Only display the Mantenimientos module
    const maintenanceModules = useMemo(() => {
        return SYSTEM_MODULES.filter((module) => module.id === "mantenimientos");
    }, []);

    // Filter modules and subitems by search query
    const filteredModules = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return maintenanceModules;

        return maintenanceModules
            .map((module) => {
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
            })
            .filter(Boolean) as ModuleItem[];
    }, [searchQuery, maintenanceModules]);

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
                <View className="px-5 pt-5">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                Módulos Operativos
                            </Text>
                            <Text className="text-[11px] text-slate-500 mt-0.5">
                                Accede a los módulos de gestión técnica
                            </Text>
                        </View>
                        <View className="rounded-full bg-slate-200/80 px-2.5 py-1">
                            <Text className="text-[10px] font-bold text-slate-700">
                                {filteredModules.length} {filteredModules.length === 1 ? "módulo" : "módulos"}
                            </Text>
                        </View>
                    </View>

                    {filteredModules.length === 0 ? (
                        <View className="rounded-2xl bg-white p-8 items-center justify-center border border-slate-200/80 my-2 shadow-2xs">
                            <Text className="text-sm font-bold text-slate-700">
                                No se encontraron resultados
                            </Text>
                            <Text className="text-xs text-slate-400 text-center mt-1">
                                Intenta buscar con otros términos como &ldquo;solicitud&rdquo;, &ldquo;orden&rdquo; o &ldquo;aprobación&rdquo;.
                            </Text>
                            <TouchableOpacity
                                onPress={() => setSearchQuery("")}
                                className="mt-4 rounded-xl bg-blue-50 px-4 py-2 border border-blue-200/60"
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
                <View className="mx-5 mt-2 rounded-2xl bg-white p-4 border border-slate-200/80 flex-row items-center justify-between shadow-2xs">
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
                        activeOpacity={0.7}
                        className="flex-row items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200/60"
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
