import { Text, View } from "react-native";
import { ServerIcon } from "@/src/components/icons";

interface ServerHeaderCardProps {
    isModifiedFromDefault: boolean;
}

export function ServerHeaderCard({ isModifiedFromDefault }: ServerHeaderCardProps) {
    return (
        <View className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/70">
            <View className="flex-row items-start gap-4">
                <View className="h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
                    <ServerIcon size={26} color="#2563eb" />
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-base font-bold text-slate-900">
                            Servidor API SIGMA
                        </Text>
                        <View
                            className={`rounded-full px-2 py-0.5 ${
                                isModifiedFromDefault
                                    ? "bg-amber-100"
                                    : "bg-slate-100"
                            }`}
                        >
                            <Text
                                className={`text-[11px] font-semibold ${
                                    isModifiedFromDefault
                                        ? "text-amber-800"
                                        : "text-slate-600"
                                }`}
                            >
                                {isModifiedFromDefault ? "Personalizado" : "Por defecto"}
                            </Text>
                        </View>
                    </View>
                    <Text className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Establece la dirección IP o dominio del backend central para sincronizar datos y autenticación.
                    </Text>
                </View>
            </View>
        </View>
    );
}
