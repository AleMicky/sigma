import { View } from "react-native";
import { SearchBar } from "@/src/components/common";

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
            <SearchBar
                value={searchQuery}
                onChangeText={onSearchChange}
                placeholder="Buscar módulos, órdenes o reportes..."
            />
        </View>
    );
}
