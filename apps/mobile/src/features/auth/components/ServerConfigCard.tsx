import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { serverConfigService } from "@/src/features/settings/services/server-config.service";
import { ChevronRightIcon, ServerIcon } from "@/src/components/icons";

export function ServerConfigCard() {
    const [serverUrl, setServerUrl] = useState<string>("");

    useEffect(() => {
        let isMounted = true;
        serverConfigService.getApiUrl().then((url) => {
            if (isMounted) {
                setServerUrl(url);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    // Format display URL for readability
    const displayUrl = serverUrl
        ? serverUrl.replace(/^https?:\/\//, "")
        : "No configurado";

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/server-config")}
            className="flex-row items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-3.5"
            accessibilityLabel="Configurar servidor"
        >
            <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                    <ServerIcon size={18} color="#2563eb" />
                </View>
                <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-700">
                        Servidor de Conexión
                    </Text>
                    <Text
                        numberOfLines={1}
                        className="text-xs font-normal text-slate-500 font-mono mt-0.5"
                    >
                        {displayUrl}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center gap-1">
                <Text className="text-xs font-medium text-blue-600">
                    Cambiar
                </Text>
                <ChevronRightIcon size={14} color="#2563eb" />
            </View>
        </TouchableOpacity>
    );
}
