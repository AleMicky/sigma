import { QueryProvider } from "@/src/providers/query-provider";
import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider";
import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <QueryProvider>
            <GluestackUIProvider mode="light">
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(app)" />
                    <Stack.Screen name="server-config" />
                </Stack>
            </GluestackUIProvider>
        </QueryProvider>
    );
}
