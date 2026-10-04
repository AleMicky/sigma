import { Stack } from "expo-router";
import { useAppTheme } from "@/theme";

export default function AppLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
