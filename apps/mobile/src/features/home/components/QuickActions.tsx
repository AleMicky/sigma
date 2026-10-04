import { Alert, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { QUICK_SHORTCUTS } from "../data/menu-modules";

export function QuickActions() {
    const handleActionPress = (title: string, route?: string) => {
        if (route) {
            router.push(route as any);
        } else {
            Alert.alert(title, `Acceso directo para ${title}`);
        }
    };

    return (
        <View className="px-5 pt-5">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Accesos Rápidos
                </Text>
                <Text className="text-xs font-semibold text-blue-600">
                    Operación
                </Text>
            </View>

            <View className="flex-row flex-wrap gap-2.5">
                {QUICK_SHORTCUTS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.7}
                            onPress={() => handleActionPress(item.title, item.route)}
                            className="flex-1 min-w-[45%] rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-xs active:bg-slate-50"
                        >
                            <View className="flex-row items-center gap-3">
                                <View
                                    style={{ backgroundColor: `${item.color}15` }}
                                    className="h-10 w-10 items-center justify-center rounded-xl"
                                >
                                    <Icon size={20} color={item.color} />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        numberOfLines={1}
                                        className="text-xs font-bold text-slate-800"
                                    >
                                        {item.title}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        className="text-[11px] text-slate-500 mt-0.5"
                                    >
                                        {item.subtitle}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
