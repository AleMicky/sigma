import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";

import { QueryProvider } from "@/providers/query-provider";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}