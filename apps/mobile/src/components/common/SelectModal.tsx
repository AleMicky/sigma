import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircleIcon, CloseIcon } from "@/src/components/icons";
import { SearchBar } from "./SearchBar";

export interface SelectModalItem {
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    raw?: any;
}

export interface SelectModalProps<T> {
    visible: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    items: T[];
    selectedId?: string | null;
    onSelect: (item: T) => void;
    keyExtractor?: (item: T) => string;
    filterFn?: (item: T, query: string) => boolean;
    renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
    getItemTitle?: (item: T) => string;
    getItemSubtitle?: (item: T) => string | undefined;
    searchPlaceholder?: string;
    isLoading?: boolean;
    emptyText?: string;
}

export function SelectModal<T extends { id?: string }>({
    visible,
    onClose,
    title,
    icon,
    items,
    selectedId,
    onSelect,
    keyExtractor = (item: any) => item.id ?? item.code ?? String(item),
    filterFn,
    renderItem,
    getItemTitle = (item: any) => item.nombreCompleto || item.nombre || item.titulo || item.name || item.id,
    getItemSubtitle = (item: any) => item.codigo || item.cargo || item.descripcion || item.subtitle,
    searchPlaceholder = "Buscar...",
    isLoading = false,
    emptyText = "No se encontraron resultados coincidentes.",
}: SelectModalProps<T>) {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return items;

        if (filterFn) {
            return items.filter((item) => filterFn(item, query));
        }

        return items.filter((item) => {
            const t = getItemTitle(item).toLowerCase();
            const s = (getItemSubtitle(item) || "").toLowerCase();
            return t.includes(query) || s.includes(query);
        });
    }, [items, searchQuery, filterFn, getItemTitle, getItemSubtitle]);

    const handleSelect = (item: T) => {
        onSelect(item);
        onClose();
        setSearchQuery("");
    };

    const handleClose = () => {
        onClose();
        setSearchQuery("");
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <View
                    style={{
                        maxHeight: "85%",
                        paddingBottom: Math.max(insets.bottom, 16),
                    }}
                    className="rounded-t-3xl bg-white p-5 shadow-2xl"
                >
                    {/* Handle bar */}
                    <View className="items-center pb-3">
                        <View className="h-1 w-10 rounded-full bg-slate-300" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                        <View className="flex-row items-center gap-2 flex-1 mr-2">
                            {icon}
                            <Text className="text-base font-extrabold text-slate-900 flex-1" numberOfLines={1}>
                                {title}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleClose}
                            className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
                        >
                            <CloseIcon size={14} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="my-3">
                        <SearchBar
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={searchPlaceholder}
                            autoFocus
                        />
                    </View>

                    {/* Content */}
                    {isLoading ? (
                        <View className="py-12 items-center justify-center">
                            <ActivityIndicator size="small" color="#2563eb" />
                            <Text className="text-xs text-slate-400 mt-2 font-medium">
                                Cargando opciones...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredItems}
                            keyExtractor={keyExtractor}
                            renderItem={({ item }) => {
                                const itemId = keyExtractor(item);
                                const isSelected = selectedId === itemId;

                                if (renderItem) {
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => handleSelect(item)}
                                        >
                                            {renderItem(item, isSelected)}
                                        </TouchableOpacity>
                                    );
                                }

                                const itemTitle = getItemTitle(item);
                                const itemSubtitle = getItemSubtitle(item);

                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => handleSelect(item)}
                                        className={`flex-row items-center justify-between p-3.5 border-b border-slate-100 rounded-xl ${
                                            isSelected
                                                ? "bg-blue-50/80 border-blue-100"
                                                : "active:bg-slate-50"
                                        }`}
                                    >
                                        <View className="flex-1 mr-2">
                                            <Text className="text-sm font-bold text-slate-800">
                                                {itemTitle}
                                            </Text>
                                            {itemSubtitle ? (
                                                <Text className="text-xs text-slate-500 font-medium mt-0.5">
                                                    {itemSubtitle}
                                                </Text>
                                            ) : null}
                                        </View>
                                        {isSelected && (
                                            <CheckCircleIcon size={18} color="#2563eb" />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View className="py-8 items-center">
                                    <Text className="text-xs text-slate-400 text-center px-4">
                                        {emptyText}
                                    </Text>
                                </View>
                            }
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}
