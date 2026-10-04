import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { QueryProvider } from "@/providers/query-provider";
import { useAppTheme } from "@/theme";
import { setupApiInterceptors } from "@/api/interceptors";
import { apiConfigService } from "@/services/api-config.service";
import { useRestoreSession } from "@/features/auth/hooks/useRestoreSession";

function RootApp() {
  const { colors, isDark } = useAppTheme();

  useRestoreSession();

  useEffect(() => {
    apiConfigService.init();
    setupApiInterceptors();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootApp />
    </QueryProvider>
  );
}