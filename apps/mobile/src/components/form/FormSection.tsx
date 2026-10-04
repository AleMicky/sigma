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

export type FormSectionProps = {
  title?: string;
  description?: string;
  rightAction?: ReactNode;
  withDivider?: boolean;
  card?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function FormSection({
  title,
  description,
  rightAction,
  withDivider = false,
  card = false,
  children,
  style,
  contentStyle,
  titleStyle,
}: FormSectionProps) {
  return (
    <View
      style={[
        styles.container,
        card && styles.cardContainer,
        withDivider && styles.divider,
        style,
      ]}
    >
      {title || description || rightAction ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? (
              <Text style={[styles.title, titleStyle]}>{title}</Text>
            ) : null}

            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>

          {rightAction ? (
            <View style={styles.actionContainer}>{rightAction}</View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  cardContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  divider: {
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  actionContainer: {
    marginLeft: spacing.xs,
  },
  content: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
});