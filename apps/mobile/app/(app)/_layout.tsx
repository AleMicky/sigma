import { ActivityIndicator, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/stores/auth.store";

export default function AppLayout() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isRestoring = useAuthStore((s) => s.isRestoring);

    if (isRestoring) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-900">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="mantenimientos/solicitudes/index" />
            <Stack.Screen name="mantenimientos/solicitudes/[id]" />
            <Stack.Screen name="mantenimientos/solicitudes/nueva" />
        </Stack>
    );
}
