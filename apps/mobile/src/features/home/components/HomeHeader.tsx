import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/src/stores/auth.store";
import { LogoutIcon, SettingsIcon } from "@/src/components/icons";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
}

export function HomeHeader() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const displayName = user?.name || user?.username || "Operador";
    const firstName = displayName.split(" ")[0];
    const initial = firstName.charAt(0).toUpperCase();
    const primaryRole = user?.roles?.[0] || "Técnico";

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que deseas salir de tu cuenta?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    return (
        <View className="bg-slate-900 pb-6 pt-2 px-5 rounded-b-3xl shadow-lg">
            {/* Top Bar: Company Pill & Actions */}
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
                <View className="flex-row items-center gap-2">
                    <View className="h-2 w-2 rounded-full bg-emerald-400" />
                    <Text className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                        ENDE CORANI S.A. • SIGMA
                    </Text>
                </View>

                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => router.push("/server-config")}
                        className="h-8.5 w-8.5 items-center justify-center rounded-full bg-slate-800 active:bg-slate-700"
                        accessibilityLabel="Configuración de servidor"
                    >
                        <SettingsIcon size={16} color="#94a3b8" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="h-8.5 w-8.5 items-center justify-center rounded-full bg-rose-500/20 active:bg-rose-500/30"
                        accessibilityLabel="Cerrar sesión"
                    >
                        <LogoutIcon size={16} color="#f87171" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Profile & Greeting Card */}
            <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                    <Text className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                        {getGreeting()}
                    </Text>
                    <Text
                        numberOfLines={1}
                        className="text-2xl font-bold text-white tracking-tight mt-0.5"
                    >
                        {firstName}
                    </Text>
                    <View className="mt-1.5 self-start rounded-md bg-blue-500/20 border border-blue-400/30 px-2 py-0.5">
                        <Text className="text-[11px] font-semibold text-blue-300">
                            Rol: {primaryRole}
                        </Text>
                    </View>
                </View>

                {/* Avatar */}
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-500/30 border border-blue-400/40">
                    <Text className="text-xl font-extrabold text-white">
                        {initial}
                    </Text>
                </View>
            </View>
        </View>
    );
}
