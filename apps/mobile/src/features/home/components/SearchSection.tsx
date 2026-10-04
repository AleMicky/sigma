import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SearchIcon } from "./icons";

interface SearchSectionProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function SearchSection({
    searchQuery,
    onSearchChange,
}: SearchSectionProps) {
    return (
        <View className="px-5 pt-4">
            <View className="h-12 flex-row items-center rounded-2xl bg-white px-3.5 border border-slate-200/90 shadow-xs">
                <SearchIcon size={18} color="#94a3b8" />
                <TextInput
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholder="Buscar módulos, órdenes o reportes..."
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-2.5 text-sm text-slate-800"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        onPress={() => onSearchChange("")}
                        className="rounded-full bg-slate-100 px-2 py-0.5"
                    >
                        <Text className="text-xs font-semibold text-slate-500">
                            Borrar
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
