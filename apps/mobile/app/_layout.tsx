import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { QueryProvider } from "@/providers/query-provider";
import { useAppTheme } from "@/theme";
import { setupApiInterceptors } from "@/api/interceptors";
import { apiConfigService } from "@/services/api-config.service";
import { useRestoreSession } from "@/features/auth/hooks/useRestoreSession";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { AppSplashScreen } from "@/components/feedback/AppSplashScreen";

function RootApp() {
  const { colors, isDark } = useAppTheme();
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useRestoreSession();

  useEffect(() => {
    apiConfigService.init();
    setupApiInterceptors();
  }, []);

  if (!isInitialized) {
    return <AppSplashScreen statusMessage="Iniciando SIGMA..." />;
  }

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