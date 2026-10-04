import React, { type ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/theme";

export type FABVariant = "primary" | "secondary" | "success" | "danger" | "surface";
export type FABSize = "sm" | "md" | "lg";
export type FABPosition = "bottom-right" | "bottom-left" | "bottom-center" | "none";

export type FloatingActionButtonProps = {
  icon?: keyof typeof Ionicons.glyphMap | ReactNode;
  label?: string;
  variant?: FABVariant;
  size?: FABSize;
  position?: FABPosition;
  badgeCount?: number;
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function FloatingActionButton({
  icon = "add",
  label,
  variant = "primary",
  size = "md",
  position = "bottom-right",
  badgeCount,
  disabled = false,
  onPress,
  style,
  labelStyle,
  accessibilityLabel,
}: FloatingActionButtonProps) {
  const isExtended = Boolean(label);
  const iconSize = size === "sm" ? 20 : size === "lg" ? 30 : 24;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return (
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={iconSize}
          color={variantStyles[variant].text.color}
        />
      );
    }
    return icon;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label || "Acción flotante"}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        isExtended && styles.extended,
        variantStyles[variant].button,
        positionStyles[position],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {renderIcon()}

      {label ? (
        <Text
          style={[
            styles.label,
            variantStyles[variant].text,
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}

      {badgeCount !== undefined && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const sizeStyles = StyleSheet.create({
  sm: {
    width: 44,
    height: 44,
  },
  md: {
    width: 56,
    height: 56,
  },
  lg: {
    width: 64,
    height: 64,
  },
});

const positionStyles = StyleSheet.create({
  "bottom-right": {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
  },
  "bottom-left": {
    position: "absolute",
    left: spacing.lg,
    bottom: spacing.xl,
  },
  "bottom-center": {
    position: "absolute",
    alignSelf: "center",
    bottom: spacing.xl,
  },
  none: {},
});

const variantStyles = {
  primary: StyleSheet.create({
    button: { backgroundColor: colors.primary },
    text: { color: colors.white },
  }),
  secondary: StyleSheet.create({
    button: { backgroundColor: colors.surfaceSecondary },
    text: { color: colors.text },
  }),
  success: StyleSheet.create({
    button: { backgroundColor: colors.success },
    text: { color: colors.white },
  }),
  danger: StyleSheet.create({
    button: { backgroundColor: colors.danger },
    text: { color: colors.white },
  }),
  surface: StyleSheet.create({
    button: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: { color: colors.text },
  }),
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    gap: spacing.xs,
    zIndex: 99,
    ...shadows.lg,
  },
  extended: {
    width: "auto",
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: colors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.5,
  },
});