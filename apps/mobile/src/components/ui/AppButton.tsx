import { type ReactNode } from "react";
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
import { radius, spacing, typography, useAppTheme } from "@/theme";

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
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  const getVariantContainerStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return { backgroundColor: colors.surfaceSecondary };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "ghost":
        return { backgroundColor: "transparent" };
      case "danger":
        return { backgroundColor: colors.danger };
      case "primary":
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getVariantTextStyle = (): TextStyle => {
    switch (variant) {
      case "secondary":
        return { color: colors.text };
      case "outline":
        return { color: colors.text };
      case "ghost":
        return { color: colors.primary };
      case "danger":
        return { color: colors.white };
      case "primary":
      default:
        return { color: colors.white };
    }
  };

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
        getVariantContainerStyle(),
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
              getVariantTextStyle(),
              styles[`text_${size}`],
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
  text_sm: {
    fontSize: typography.fontSize.sm,
  },
  text_md: {
    fontSize: typography.fontSize.md,
  },
  text_lg: {
    fontSize: typography.fontSize.lg,
  },
});