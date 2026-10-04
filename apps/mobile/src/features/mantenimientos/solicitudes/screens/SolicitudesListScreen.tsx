import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
    ArrowLeftIcon,
    CloseIcon,
    PlusIcon,
    SearchIcon,
    WrenchIcon,
} from "@/src/components/icons";
import {
    SolicitudCard,
    SolicitudFilterTabs,
} from "../components";
import {
    useSolicitudResumenQuery,
    useSolicitudesQuery,
} from "../hooks/use-solicitudes";

export function SolicitudesListScreen() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEstado, setSelectedEstado] = useState<string | undefined>(
        undefined
    );

    // Queries
    const {
        data: solicitudesPage,
        isLoading,
        isRefetching,
        refetch,
        isError,
        error,
    } = useSolicitudesQuery({
        q: searchQuery || undefined,
        estado: selectedEstado || undefined,
        size: 50,
    });

    const { data: resumen } = useSolicitudResumenQuery();

    const solicitudes = solicitudesPage?.content ?? [];
    const totalCount = solicitudesPage?.totalElements ?? solicitudes.length;

    const hasActiveFilters = Boolean(selectedEstado || searchQuery.trim().length > 0);

    const handleClearFilters = () => {
        setSearchQuery("");
        setSelectedEstado(undefined);
    };

    const handleCreateNew = () => {
        router.push("/(app)/mantenimientos/solicitudes/nueva");
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header Móvil Moderno */}
            <View
                style={{ paddingTop: Math.max(insets.top, 12) }}
                className="bg-white border-b border-slate-200/80 shadow-sm"
            >
                {/* Barra Superior */}
                <View className="flex-row items-center justify-between px-4 pb-2">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => router.back()}
                            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
                            accessibilityLabel="Regresar"
                        >
                            <ArrowLeftIcon size={18} color="#0f172a" />
                        </TouchableOpacity>

                        <View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-xl font-black text-slate-900 tracking-tight">
                                    Solicitudes
                                </Text>
                                {totalCount > 0 && (
                                    <View className="rounded-full bg-blue-50 px-2.5 py-0.5 border border-blue-100">
                                        <Text className="text-[11px] font-bold text-blue-700">
                                            {totalCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-[11px] font-medium text-slate-400">
                                Mantenimiento correctivo y preventivo
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Barra de Búsqueda Móvil */}
                <View className="px-4 pt-1 pb-2">
                    <View className="flex-row items-center rounded-2xl bg-slate-100 px-3.5 h-11 border border-slate-200/70">
                        <SearchIcon size={16} color="#64748b" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Buscar por código, título o equipo..."
                            placeholderTextColor="#94a3b8"
                            className="flex-1 ml-2.5 text-[13px] text-slate-900 font-medium"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery("")}
                                className="h-6 w-6 items-center justify-center rounded-full bg-slate-200 active:bg-slate-300"
                            >
                                <CloseIcon size={11} color="#475569" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Chips de Filtro Rápido (Mobile Scroll) */}
                <SolicitudFilterTabs
                    selectedEstado={selectedEstado}
                    onSelectEstado={setSelectedEstado}
                    counts={{
                        total: resumen?.total,
                        enRevision: resumen?.enRevision ?? resumen?.porRevisar,
                        enProceso: resumen?.enProceso ?? resumen?.enEjecucion,
                        borradores: resumen?.borradores,
                        finalizadas: resumen?.finalizadas ?? resumen?.trabajoConcluido,
                    }}
                />
            </View>

            {/* Sub-barra de Filtros Activos / Conteo de Resultados */}
            {hasActiveFilters && (
                <View className="bg-slate-100/80 px-4 py-2 flex-row items-center justify-between border-b border-slate-200/60">
                    <Text className="text-[11px] font-semibold text-slate-600">
                        {solicitudes.length === 1
                            ? "1 resultado encontrado"
                            : `${solicitudes.length} resultados encontrados`}
                    </Text>
                    <TouchableOpacity
                        onPress={handleClearFilters}
                        activeOpacity={0.7}
                        className="flex-row items-center gap-1"
                    >
                        <Text className="text-[11px] font-bold text-blue-600">
                            Limpiar filtros
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Listado de Solicitudes */}
            <FlatList
                data={solicitudes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <SolicitudCard solicitud={item} />}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: Math.max(insets.bottom, 20) + 80,
                    flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor="#2563eb"
                        colors={["#2563eb"]}
                    />
                }
                ListEmptyComponent={
                    isLoading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#2563eb" />
                            <Text className="mt-3 text-xs font-semibold text-slate-500">
                                Cargando solicitudes...
                            </Text>
                        </View>
                    ) : isError ? (
                        <View className="my-8 rounded-3xl bg-white p-6 items-center border border-rose-100 shadow-sm">
                            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 mb-3">
                                <CloseIcon size={20} color="#dc2626" />
                            </View>
                            <Text className="text-sm font-bold text-slate-900">
                                Error al cargar solicitudes
                            </Text>
                            <Text className="text-xs text-slate-500 text-center mt-1 leading-relaxed">
                                {(error as any)?.message ||
                                    "No se pudo conectar con el servidor para obtener los datos."}
                            </Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                activeOpacity={0.8}
                                className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 active:bg-slate-800"
                            >
                                <Text className="text-xs font-bold text-white">
                                    Reintentar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="my-8 rounded-3xl bg-white p-8 items-center border border-slate-200/80 shadow-sm">
                            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/80 mb-3 border border-blue-100">
                                {hasActiveFilters ? (
                                    <SearchIcon size={24} color="#2563eb" />
                                ) : (
                                    <WrenchIcon size={24} color="#2563eb" />
                                )}
                            </View>
                            <Text className="text-base font-bold text-slate-900">
                                {hasActiveFilters
                                    ? "Sin resultados"
                                    : "No hay solicitudes registradas"}
                            </Text>
                            <Text className="text-xs text-slate-500 text-center mt-1 leading-relaxed max-w-[260px]">
                                {selectedEstado
                                    ? `No hay solicitudes en estado "${selectedEstado}".`
                                    : searchQuery
                                    ? `No se encontraron coincidencias para "${searchQuery}".`
                                    : "Comienza creando tu primera solicitud de mantenimiento para tus activos."}
                            </Text>

                            {hasActiveFilters ? (
                                <TouchableOpacity
                                    onPress={handleClearFilters}
                                    activeOpacity={0.8}
                                    className="mt-5 rounded-xl bg-slate-100 px-4 py-2.5 border border-slate-200"
                                >
                                    <Text className="text-xs font-bold text-slate-700">
                                        Restablecer búsqueda
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleCreateNew}
                                    activeOpacity={0.85}
                                    className="mt-5 flex-row items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 shadow-sm active:bg-blue-700"
                                >
                                    <PlusIcon size={14} color="#ffffff" />
                                    <Text className="text-xs font-bold text-white">
                                        Crear Solicitud
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                }
            />

            {/* Mobile Floating Action Button (FAB) */}
            <View
                style={{ bottom: Math.max(insets.bottom, 16) + 16 }}
                className="absolute right-4"
            >
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleCreateNew}
                    className="flex-row items-center gap-2 rounded-full bg-blue-600 pl-4 pr-5 py-3.5 shadow-md active:bg-blue-700"
                >
                    <PlusIcon size={18} color="#ffffff" />
                    <Text className="text-sm font-bold text-white tracking-wide">
                        Nueva Solicitud
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

