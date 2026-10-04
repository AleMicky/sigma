import React, { type ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, shadows, spacing, typography } from "@/theme";

export type StatCardVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export type StatCardTrend = {
  value: string | number;
  isPositive?: boolean;
};

export type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: StatCardTrend;
  badge?: ReactNode;
  variant?: StatCardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  badge,
  variant = "default",
  onPress,
  style,
  titleStyle,
  valueStyle,
}: StatCardProps) {
  const isInteractive = Boolean(onPress);

  return (
    <Pressable
      onPress={onPress}
      disabled={!isInteractive}
      accessibilityRole={isInteractive ? "button" : undefined}
      style={({ pressed }) => [
        styles.container,
        variantStyles[variant].container,
        isInteractive && styles.interactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            variantStyles[variant].title,
            titleStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.headerRight}>
          {badge}
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        </View>
      </View>

      <Text
        style={[
          styles.value,
          variantStyles[variant].value,
          valueStyle,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      {description || trend ? (
        <View style={styles.footer}>
          {trend ? (
            <View style={styles.trendRow}>
              <Ionicons
                name={trend.isPositive ? "trending-up" : "trending-down"}
                size={14}
                color={trend.isPositive ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: trend.isPositive ? colors.success : colors.danger },
                ]}
              >
                {trend.value}
              </Text>
            </View>
          ) : null}

          {description ? (
            <Text
              style={[
                styles.description,
                variantStyles[variant].description,
              ]}
              numberOfLines={1}
            >
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const variantStyles = {
  default: StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    title: { color: colors.textSecondary },
    value: { color: colors.text },
    description: { color: colors.textSecondary },
  }),
  primary: StyleSheet.create({
    container: {
      backgroundColor: colors.primaryLight,
      borderColor: "#BFDBFE",
    },
    title: { color: colors.primaryDark },
    value: { color: colors.primaryDark },
    description: { color: colors.primaryDark },
  }),
  success: StyleSheet.create({
    container: {
      backgroundColor: "#DCFCE7",
      borderColor: "#BBF7D0",
    },
    title: { color: "#15803D" },
    value: { color: "#166534" },
    description: { color: "#15803D" },
  }),
  warning: StyleSheet.create({
    container: {
      backgroundColor: "#FEF3C7",
      borderColor: "#FDE68A",
    },
    title: { color: "#B45309" },
    value: { color: "#92400E" },
    description: { color: "#B45309" },
  }),
  danger: StyleSheet.create({
    container: {
      backgroundColor: colors.dangerLight,
      borderColor: "#FECACA",
    },
    title: { color: colors.danger },
    value: { color: "#991B1B" },
    description: { color: colors.danger },
  }),
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md + 2,
    borderWidth: 1,
    borderRadius: radius.lg,
    gap: spacing.xs,
    ...shadows.sm,
  },
  interactive: {
    cursor: "pointer",
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  value: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: typography.fontWeight.bold,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  trendText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  description: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    flex: 1,
  },
});