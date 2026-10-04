import { QueryProvider } from "@/src/providers/query-provider";
import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <QueryProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
                <Stack.Screen name="server-config" />
            </Stack>
        </QueryProvider>
    );
}
