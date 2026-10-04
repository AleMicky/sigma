import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
    CloseIcon,
    PlusIcon,
    SearchIcon,
    WrenchIcon,
} from "@/src/components/icons";
import {
    EmptyState,
    SearchBar,
    ScreenHeader,
} from "@/src/components/common";
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
            {/* Standardized Mobile Header with Quick Action */}
            <ScreenHeader
                title="Solicitudes"
                subtitle="Mantenimiento correctivo y preventivo"
                badgeCount={totalCount}
                rightAction={{
                    icon: <PlusIcon size={14} color="#ffffff" />,
                    label: "Nueva",
                    variant: "primary",
                    onPress: handleCreateNew,
                }}
            />

            {/* Sticky Filters & Search Subheader */}
            <View className="bg-white border-b border-slate-200/80 shadow-2xs">
                {/* Reusable Search Bar */}
                <View className="px-4 pt-2.5 pb-2">
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Buscar por código, título o equipo..."
                        onClear={handleClearFilters}
                    />
                </View>

                {/* Filter Tabs */}
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

            {/* Active Filters Info Bar */}
            {hasActiveFilters && (
                <View className="bg-blue-50/70 px-4 py-2 flex-row items-center justify-between border-b border-blue-100">
                    <View className="flex-row items-center gap-1.5 flex-1 pr-2">
                        <Text className="text-[11px] font-semibold text-blue-900">
                            {solicitudes.length === 1
                                ? "1 resultado encontrado"
                                : `${solicitudes.length} resultados`}
                        </Text>
                        {selectedEstado && (
                            <View className="rounded-md bg-blue-100 px-1.5 py-0.5">
                                <Text className="text-[10px] font-bold text-blue-800">
                                    {selectedEstado}
                                </Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={handleClearFilters}
                        activeOpacity={0.7}
                        className="flex-row items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1"
                    >
                        <CloseIcon size={12} color="#1d4ed8" />
                        <Text className="text-[11px] font-bold text-blue-700">
                            Limpiar
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Solicitudes List */}
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
                        <EmptyState
                            title="Error al cargar solicitudes"
                            description={
                                (error as any)?.message ||
                                "No se pudo conectar con el servidor para obtener los datos."
                            }
                            actionLabel="Reintentar"
                            onAction={() => refetch()}
                        />
                    ) : (
                        <EmptyState
                            icon={
                                hasActiveFilters ? (
                                    <SearchIcon size={24} color="#2563eb" />
                                ) : (
                                    <WrenchIcon size={24} color="#2563eb" />
                                )
                            }
                            title={
                                hasActiveFilters
                                    ? "Sin resultados"
                                    : "No hay solicitudes registradas"
                            }
                            description={
                                selectedEstado
                                    ? `No hay solicitudes en estado "${selectedEstado}".`
                                    : searchQuery
                                    ? `No se encontraron coincidencias para "${searchQuery}".`
                                    : "Comienza creando tu primera solicitud de mantenimiento para tus activos."
                            }
                            actionLabel={
                                hasActiveFilters
                                    ? "Restablecer búsqueda"
                                    : "Crear Solicitud"
                            }
                            onAction={
                                hasActiveFilters
                                    ? handleClearFilters
                                    : handleCreateNew
                            }
                            actionIcon={
                                !hasActiveFilters && (
                                    <PlusIcon size={14} color="#ffffff" />
                                )
                            }
                        />
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
