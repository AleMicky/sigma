import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Input, InputField, InputSlot } from "@/src/components/ui/input";
import { CloseIcon, SearchIcon } from "@/src/components/icons";

export interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
    className?: string;
    autoFocus?: boolean;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = "Buscar...",
    onClear,
    className = "",
    autoFocus = false,
}: SearchBarProps) {
    const handleClear = () => {
        onChangeText("");
        onClear?.();
    };

    return (
        <View className={`w-full ${className}`}>
            <Input className="h-11 rounded-2xl bg-slate-100 border-slate-200/80 px-3.5 focus:border-blue-500 focus:bg-white shadow-2xs">
                <InputSlot className="mr-1">
                    <SearchIcon size={16} color="#64748b" />
                </InputSlot>
                <InputField
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    className="text-xs font-medium text-slate-900"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                    autoFocus={autoFocus}
                />
                {value.length > 0 && (
                    <InputSlot>
                        <TouchableOpacity
                            onPress={handleClear}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            className="h-6 w-6 items-center justify-center rounded-full bg-slate-200 active:bg-slate-300"
                        >
                            <CloseIcon size={11} color="#475569" />
                        </TouchableOpacity>
                    </InputSlot>
                )}
            </Input>
        </View>
    );
}
