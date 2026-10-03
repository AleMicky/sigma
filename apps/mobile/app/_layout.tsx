import { QueryProvider } from "@/src/providers/query-provider";
import "../global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </QueryProvider>
  );
}
