import React, { type ReactNode } from "react";
import {
  Linking,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, spacing, typography } from "@/theme";

export type LinkVariant = "primary" | "secondary" | "danger" | "muted";
export type LinkSize = "sm" | "md" | "lg";

export type AppLinkProps = {
  children?: ReactNode;
  href?: string;
  onPress?: () => void;
  variant?: LinkVariant;
  size?: LinkSize;
  underline?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export function AppLink({
  children,
  href,
  onPress,
  variant = "primary",
  size = "md",
  underline = false,
  disabled = false,
  leftIcon,
  rightIcon,
  numberOfLines,
  style,
  textStyle,
  accessibilityLabel,
}: AppLinkProps) {
  const handlePress = async () => {
    if (disabled) return;
    if (onPress) {
      onPress();
      return;
    }
    if (href) {
      const canOpen = await Linking.canOpenURL(href);
      if (canOpen) {
        await Linking.openURL(href);
      }
    }
  };

  const textColor = disabled ? colors.textMuted : variantColors[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="link"
      accessibilityState={{ disabled }}
      accessibilityLabel={
        accessibilityLabel ||
        (typeof children === "string" ? children : undefined)
      }
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}

      {typeof children === "string" ? (
        <Text
          numberOfLines={numberOfLines}
          style={[
            styles.text,
            sizeStyles[size],
            { color: textColor },
            underline && styles.underline,
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}

      {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
    </Pressable>
  );
}

const variantColors: Record<LinkVariant, string> = {
  primary: colors.primary,
  secondary: colors.textSecondary,
  danger: colors.danger,
  muted: colors.textMuted,
};

const sizeStyles = StyleSheet.create({
  sm: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  md: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  lg: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.65,
  },
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  underline: {
    textDecorationLine: "underline",
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});