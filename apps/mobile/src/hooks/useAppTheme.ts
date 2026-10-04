import { useColorScheme } from "react-native";

import { useThemeStore } from "@/store/useThemeStore";
import { darkColors, lightColors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { shadows } from "@/theme/shadows";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode, toggleTheme } = useThemeStore();

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  const currentColors = isDark ? darkColors : lightColors;

  return {
    colors: currentColors,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
    spacing,
    radius,
    typography,
    shadows,
  };
}
