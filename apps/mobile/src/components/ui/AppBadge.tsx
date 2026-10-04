import { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { radius, spacing, typography, useAppTheme } from "@/theme";

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
  const { colors, isDark } = useAppTheme();

  const getVariantStyles = () => {
    if (appearance === "solid") {
      switch (variant) {
        case "primary":
          return {
            badge: { backgroundColor: colors.primary },
            text: { color: colors.white },
            dotColor: colors.white,
          };
        case "success":
          return {
            badge: { backgroundColor: colors.success },
            text: { color: colors.white },
            dotColor: colors.white,
          };
        case "warning":
          return {
            badge: { backgroundColor: colors.warning },
            text: { color: colors.white },
            dotColor: colors.white,
          };
        case "danger":
          return {
            badge: { backgroundColor: colors.danger },
            text: { color: colors.white },
            dotColor: colors.white,
          };
        case "default":
        default:
          return {
            badge: { backgroundColor: colors.surfaceSecondary },
            text: { color: colors.text },
            dotColor: colors.text,
          };
      }
    }

    // Subtle appearance
    switch (variant) {
      case "primary":
        return {
          badge: { backgroundColor: colors.primaryLight },
          text: { color: isDark ? colors.primary : colors.primaryDark },
          dotColor: colors.primary,
        };
      case "success":
        return {
          badge: { backgroundColor: isDark ? "#064E3B" : "#DCFCE7" },
          text: { color: isDark ? "#4ADE80" : "#15803D" },
          dotColor: colors.success,
        };
      case "warning":
        return {
          badge: { backgroundColor: isDark ? "#78350F" : "#FEF3C7" },
          text: { color: isDark ? "#FCD34D" : "#B45309" },
          dotColor: colors.warning,
        };
      case "danger":
        return {
          badge: { backgroundColor: colors.dangerLight },
          text: { color: colors.danger },
          dotColor: colors.danger,
        };
      case "default":
      default:
        return {
          badge: { backgroundColor: colors.surfaceSecondary },
          text: { color: colors.textSecondary },
          dotColor: colors.textSecondary,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        size === "sm" ? styles.size_sm : styles.size_md,
        vStyles.badge,
        style,
      ]}
    >
      {dot ? (
        <View style={[styles.dot, { backgroundColor: vStyles.dotColor }]} />
      ) : null}
      {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}
      <Text
        style={[
          styles.text,
          size === "sm" ? styles.text_sm : styles.text_md,
          vStyles.text,
          textStyle,
        ]}
      >
        {label}
      </Text>
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
  size_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
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
  text_sm: {
    fontSize: 11,
    lineHeight: 14,
  },
  text_md: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
});