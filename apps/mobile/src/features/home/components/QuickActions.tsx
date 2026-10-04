import { Alert, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { QUICK_SHORTCUTS } from "../data/menu-modules";

export function QuickActions() {
    const handleActionPress = (title: string, route?: string) => {
        if (route) {
            router.push(route as any);
        } else {
            Alert.alert(
                title,
                `${title} estará disponible próximamente en la aplicación móvil.`
            );
        }
    };

    return (
        <View className="px-5 pt-5">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Accesos Rápidos
                    </Text>
                    <View className="rounded-full bg-blue-100 px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-blue-700">
                            Mantenimiento
                        </Text>
                    </View>
                </View>
                <Text className="text-[11px] font-medium text-slate-500">
                    Acciones directas
                </Text>
            </View>

            <View className="flex-row flex-wrap gap-2.5">
                {QUICK_SHORTCUTS.map((item, index) => {
                    const Icon = item.icon;
                    const isPrimary = index === 0;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.75}
                            onPress={() => handleActionPress(item.title, item.route)}
                            className={`flex-1 min-w-[46%] rounded-2xl p-3.5 border shadow-2xs ${
                                isPrimary
                                    ? "bg-blue-600 border-blue-600 active:bg-blue-700"
                                    : "bg-white border-slate-200/90 active:bg-slate-50"
                            }`}
                        >
                            <View className="flex-row items-start justify-between">
                                <View
                                    style={{
                                        backgroundColor: isPrimary
                                            ? "rgba(255, 255, 255, 0.2)"
                                            : `${item.color}15`,
                                    }}
                                    className="h-10 w-10 items-center justify-center rounded-xl"
                                >
                                    <Icon
                                        size={20}
                                        color={isPrimary ? "#ffffff" : item.color}
                                    />
                                </View>

                                {item.badge && (
                                    <View
                                        className={`rounded-full px-2 py-0.5 ${
                                            isPrimary
                                                ? "bg-white/25"
                                                : "bg-blue-50 border border-blue-200/60"
                                        }`}
                                    >
                                        <Text
                                            className={`text-[9px] font-bold ${
                                                isPrimary
                                                    ? "text-white"
                                                    : "text-blue-600"
                                            }`}
                                        >
                                            {item.badge}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View className="mt-2.5">
                                <Text
                                    numberOfLines={1}
                                    className={`text-xs font-bold ${
                                        isPrimary
                                            ? "text-white"
                                            : "text-slate-800"
                                    }`}
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    className={`text-[11px] mt-0.5 ${
                                        isPrimary
                                            ? "text-blue-100"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {item.subtitle}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

