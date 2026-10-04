import React, { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  type PressableProps,
} from "react-native";
import { colors, radius, spacing, typography } from "../../theme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type AppButtonProps = Omit<PressableProps, "style"> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const loaderColor =
    variant === "outline" || variant === "ghost"
      ? colors.primary
      : colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.textBase,
              textVariantStyles[variant],
              textSizeStyles[size],
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginHorizontal: spacing.xs,
  },
  // Variantes
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceSecondary,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  // Tamaños
  sm: {
    height: 38,
    paddingHorizontal: spacing.md,
  },
  md: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
  // Estados
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  // Tipografía base
  textBase: {
    fontWeight: typography.fontWeight.semibold,
  },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.text },
  outline: { color: colors.text },
  ghost: { color: colors.primary },
  danger: { color: colors.white },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: typography.fontSize.sm },
  md: { fontSize: typography.fontSize.md },
  lg: { fontSize: typography.fontSize.lg },
});