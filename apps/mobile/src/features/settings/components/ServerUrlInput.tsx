import { Text, View } from "react-native";
import { Input, InputField, InputSlot } from "@/src/components/ui/input";
import { AlertCircleIcon, CloseIcon, GlobeIcon } from "@/src/components/icons";

interface ServerUrlInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
    error?: string | null;
}

export function ServerUrlInput({
    value,
    onChangeText,
    onClear,
    error,
}: ServerUrlInputProps) {
    const trimmed = value.trim();
    const isHttps = trimmed.startsWith("https://");

    return (
        <View>
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Dirección del Servidor (URL)
                </Text>
                {trimmed.length > 0 && (
                    <Text className="text-[11px] text-slate-400">
                        {isHttps ? "🔒 Conexión segura (HTTPS)" : "🔓 HTTP"}
                    </Text>
                )}
            </View>

            {/* Input component with Gluestack context */}
            <Input
                className={`h-12 rounded-xl border bg-slate-50/50 px-3 flex-row items-center ${
                    error
                        ? "border-rose-300 bg-rose-50/30"
                        : "border-slate-300 focus:border-blue-600 focus:bg-white"
                }`}
            >
                <InputSlot className="mr-1">
                    <GlobeIcon size={18} color={error ? "#e11d48" : "#64748b"} />
                </InputSlot>

                <InputField
                    className="flex-1 text-sm font-medium text-slate-900"
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="http://192.168.1.100:8080"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                />

                {value.length > 0 && (
                    <InputSlot onPress={onClear} hitSlop={8} className="p-1">
                        <CloseIcon size={16} color="#94a3b8" />
                    </InputSlot>
                )}
            </Input>

            {/* Zod Validation Error Feedback */}
            {error && (
                <View className="flex-row items-center gap-1.5 mt-2">
                    <AlertCircleIcon size={14} color="#e11d48" />
                    <Text className="text-xs font-medium text-rose-600">
                        {error}
                    </Text>
                </View>
            )}
        </View>
    );
}
