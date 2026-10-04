import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { AlertCircleIcon, CheckCircleIcon, WifiIcon } from "./icons";

export type TestStatus = "idle" | "testing" | "success" | "error";

interface ServerConnectionTestProps {
    status: TestStatus;
    message: string;
    latency: number | null;
    disabled: boolean;
    onTest: () => void;
}

export function ServerConnectionTest({
    status,
    message,
    latency,
    disabled,
    onTest,
}: ServerConnectionTestProps) {
    const isTesting = status === "testing";

    return (
        <View className="mt-4 pt-4 border-t border-slate-100">
            <TouchableOpacity
                onPress={onTest}
                disabled={disabled || isTesting}
                activeOpacity={0.75}
                className={`flex-row items-center justify-center gap-2 rounded-xl py-2.5 border ${
                    isTesting
                        ? "bg-slate-100 border-slate-200"
                        : disabled
                        ? "bg-slate-100/60 border-slate-200 opacity-60"
                        : "bg-blue-50/80 border-blue-200 active:bg-blue-100"
                }`}
            >
                {isTesting ? (
                    <>
                        <ActivityIndicator size="small" color="#2563eb" />
                        <Text className="text-xs font-semibold text-blue-700">
                            Comprobando servidor...
                        </Text>
                    </>
                ) : (
                    <>
                        <WifiIcon size={16} color="#2563eb" />
                        <Text className="text-xs font-semibold text-blue-700">
                            Probar conexión con el servidor
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Success Feedback Banner */}
            {status === "success" && (
                <View className="mt-3 flex-row items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                    <CheckCircleIcon size={18} color="#16a34a" />
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-emerald-900">
                            ¡Conexión verificada!
                        </Text>
                        <Text className="text-xs text-emerald-700 mt-0.5">
                            {message}
                        </Text>
                        {latency !== null && (
                            <Text className="text-[11px] font-semibold text-emerald-600 mt-1">
                                Tiempo de respuesta: {latency} ms
                            </Text>
                        )}
                    </View>
                </View>
            )}

            {/* Error Feedback Banner */}
            {status === "error" && (
                <View className="mt-3 flex-row items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3">
                    <AlertCircleIcon size={18} color="#dc2626" />
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-rose-900">
                            No se pudo conectar
                        </Text>
                        <Text className="text-xs text-rose-700 mt-0.5">
                            {message}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}
