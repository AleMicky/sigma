import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { QueryProvider } from "@/providers/query-provider";
import { useAppTheme } from "@/theme";
import { setupApiInterceptors } from "@/api/interceptors";
import { apiConfigService } from "@/services/api-config.service";
import { useEffect } from "react";

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    apiConfigService.init();
    setupApiInterceptors();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}