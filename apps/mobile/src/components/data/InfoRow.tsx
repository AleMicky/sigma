import React, { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, spacing, typography } from "@/theme";

export type InfoRowValueColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "muted";

export type InfoRowProps = {
  label: string;
  value?: string | number | ReactNode | null;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
  withDivider?: boolean;
  valueColor?: InfoRowValueColor;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export function InfoRow({
  label,
  value,
  subtitle,
  icon,
  right,
  withDivider = false,
  valueColor = "default",
  style,
  labelStyle,
  valueStyle,
}: InfoRowProps) {
  const textColor = valueColorMap[valueColor];

  return (
    <View
      style={[
        styles.container,
        withDivider && styles.divider,
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}

      <View style={styles.content}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {typeof value === "string" || typeof value === "number" ? (
          <Text
            style={[
              styles.value,
              { color: textColor },
              valueStyle,
            ]}
          >
            {value}
          </Text>
        ) : value !== null && value !== undefined ? (
          value
        ) : (
          <Text style={[styles.value, styles.placeholder]}>-</Text>
        )}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const valueColorMap: Record<InfoRowValueColor, string> = {
  default: colors.text,
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  muted: colors.textMuted,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  divider: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textMuted,
  },
  value: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.semibold,
  },
  placeholder: {
    color: colors.textMuted,
  },
  right: {
    marginLeft: spacing.xs,
  },
});