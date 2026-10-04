import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { QueryProvider } from "@/providers/query-provider";
import { useAppTheme } from "@/theme";

export default function RootLayout() {
  const { isDark } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}