import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  type PressableProps,
} from "react-native";
import { colors, radius, type ColorKey } from "@/theme";

export type IconButtonVariant =
  | "ghost"
  | "tonal"
  | "outline"
  | "filled"
  | "danger";

export type IconButtonSize = "sm" | "md" | "lg";

export type AppIconButtonProps = Omit<PressableProps, "style"> & {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: ColorKey | (string & {});
  iconSize?: number;
  loading?: boolean;
  badgeCount?: number;
  badgeDot?: boolean;
  style?: StyleProp<ViewStyle>;
};

const sizeMap = {
  sm: { button: 32, icon: 18 },
  md: { button: 40, icon: 22 },
  lg: { button: 48, icon: 26 },
};

export function AppIconButton({
  icon,
  accessibilityLabel,
  variant = "ghost",
  size = "md",
  color,
  iconSize,
  loading = false,
  badgeCount,
  badgeDot = false,
  disabled,
  style,
  ...props
}: AppIconButtonProps) {
  const currentSize = sizeMap[size];
  const finalIconSize = iconSize ?? currentSize.icon;

  const defaultIconColor =
    variant === "filled"
      ? colors.white
      : variant === "danger"
        ? colors.danger
        : colors.text;

  const resolvedColor = color
    ? (colors[color as ColorKey] ?? color)
    : defaultIconColor;

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        {
          width: currentSize.button,
          height: currentSize.button,
        },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={resolvedColor} />
      ) : (
        <>
          <Ionicons name={icon} size={finalIconSize} color={resolvedColor} />

          {badgeCount && badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </Text>
            </View>
          ) : badgeDot ? (
            <View style={styles.badgeDot} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    position: "relative",
  },
  // Variantes
  ghost: {
    backgroundColor: "transparent",
  },
  tonal: {
    backgroundColor: colors.surfaceSecondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.dangerLight,
  },
  // Estados
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },
  disabled: {
    opacity: 0.4,
  },
  // Badges
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
  },
  badgeDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});