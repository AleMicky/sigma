import React, { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/theme";

export type DetailCardVariant = "default" | "outlined" | "elevated";

export type DetailCardProps = {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  variant?: DetailCardVariant;
  withHeaderDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function DetailCard({
  title,
  subtitle,
  icon,
  headerRight,
  footer,
  children,
  variant = "outlined",
  withHeaderDivider = false,
  style,
  contentStyle,
  titleStyle,
}: DetailCardProps) {
  const hasHeader = Boolean(title || subtitle || icon || headerRight);

  return (
    <View
      style={[
        styles.container,
        variantStyles[variant],
        style,
      ]}
    >
      {hasHeader ? (
        <View
          style={[
            styles.header,
            withHeaderDivider && styles.headerDivider,
          ]}
        >
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

          <View style={styles.headerText}>
            {title ? (
              <Text style={[styles.title, titleStyle]}>{title}</Text>
            ) : null}

            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : null}
          </View>

          {headerRight ? (
            <View style={styles.rightContainer}>{headerRight}</View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlined: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.background,
    ...shadows.sm,
  },
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerDivider: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  rightContainer: {
    marginLeft: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
  content: {
    gap: spacing.sm,
  },
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});