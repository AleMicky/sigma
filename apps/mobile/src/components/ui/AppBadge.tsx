import React, { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export type BadgeSize = "sm" | "md";
export type BadgeAppearance = "subtle" | "solid";

export type AppBadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  appearance?: BadgeAppearance;
  dot?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppBadge({
  label,
  variant = "default",
  size = "md",
  appearance = "subtle",
  dot = false,
  leftIcon,
  style,
  textStyle,
}: AppBadgeProps) {
  const containerStyle = [
    styles.badge,
    sizeStyles[size].badge,
    variantStyles[appearance][variant].badge,
    style,
  ];

  const labelStyle = [
    styles.text,
    sizeStyles[size].text,
    variantStyles[appearance][variant].text,
    textStyle,
  ];

  const dotColor = variantStyles[appearance][variant].dotColor;

  return (
    <View style={containerStyle}>
      {dot ? (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      ) : null}
      {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
});

const sizeStyles = {
  sm: StyleSheet.create({
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    text: {
      fontSize: 11,
      lineHeight: 14,
    },
  }),
  md: StyleSheet.create({
    badge: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 4,
    },
    text: {
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.xs,
    },
  }),
};

const variantStyles = {
  subtle: {
    default: {
      badge: { backgroundColor: colors.surfaceSecondary },
      text: { color: colors.textSecondary },
      dotColor: colors.textSecondary,
    },
    primary: {
      badge: { backgroundColor: colors.primaryLight },
      text: { color: colors.primaryDark },
      dotColor: colors.primary,
    },
    success: {
      badge: { backgroundColor: "#DCFCE7" },
      text: { color: "#15803D" },
      dotColor: colors.success,
    },
    warning: {
      badge: { backgroundColor: "#FEF3C7" },
      text: { color: "#B45309" },
      dotColor: colors.warning,
    },
    danger: {
      badge: { backgroundColor: colors.dangerLight },
      text: { color: colors.danger },
      dotColor: colors.danger,
    },
  },
  solid: {
    default: {
      badge: { backgroundColor: colors.surfaceSecondary },
      text: { color: colors.text },
      dotColor: colors.text,
    },
    primary: {
      badge: { backgroundColor: colors.primary },
      text: { color: colors.white },
      dotColor: colors.white,
    },
    success: {
      badge: { backgroundColor: colors.success },
      text: { color: colors.white },
      dotColor: colors.white,
    },
    warning: {
      badge: { backgroundColor: colors.warning },
      text: { color: colors.white },
      dotColor: colors.white,
    },
    danger: {
      badge: { backgroundColor: colors.danger },
      text: { color: colors.white },
      dotColor: colors.white,
    },
  },
};