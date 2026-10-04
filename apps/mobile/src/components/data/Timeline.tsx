import React, { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "@/theme";

export type TimelineItemVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export type TimelineItem = {
  id: string | number;
  title: string;
  description?: string;
  date?: string;
  active?: boolean;
  variant?: TimelineItemVariant;
  icon?: ReactNode;
  content?: ReactNode;
};

export type TimelineProps = {
  items: TimelineItem[];
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
};

export function Timeline({
  items,
  style,
  titleStyle,
  descriptionStyle,
}: TimelineProps) {
  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const variant = item.variant || (item.active ? "primary" : "neutral");
        const dotColor = variantColors[variant].dot;
        const lineColor = variantColors[variant].line;

        return (
          <View key={item.id} style={styles.item}>
            <View style={styles.indicatorContainer}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: dotColor },
                  item.icon ? styles.dotWithIcon : null,
                ]}
              >
                {item.icon ? (
                  item.icon
                ) : item.active ? (
                  <Ionicons name="checkmark" size={10} color={colors.white} />
                ) : null}
              </View>

              {!isLast ? (
                <View style={[styles.line, { backgroundColor: lineColor }]} />
              ) : null}
            </View>

            <View style={[styles.content, isLast && styles.contentLast]}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, titleStyle]}>{item.title}</Text>

                {item.date ? (
                  <Text style={styles.date}>{item.date}</Text>
                ) : null}
              </View>

              {item.description ? (
                <Text style={[styles.description, descriptionStyle]}>
                  {item.description}
                </Text>
              ) : null}

              {item.content ? (
                <View style={styles.customContent}>{item.content}</View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const variantColors: Record<
  TimelineItemVariant,
  { dot: string; line: string }
> = {
  primary: { dot: colors.primary, line: colors.primaryLight },
  success: { dot: colors.success, line: "#DCFCE7" },
  warning: { dot: colors.warning, line: "#FEF3C7" },
  danger: { dot: colors.danger, line: colors.dangerLight },
  neutral: { dot: colors.borderDark, line: colors.border },
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  item: {
    flexDirection: "row",
    gap: spacing.md,
  },
  indicatorContainer: {
    alignItems: "center",
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  dotWithIcon: {
    width: 20,
    height: 20,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 36,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  contentLast: {
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  description: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
  date: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textMuted,
  },
  customContent: {
    marginTop: spacing.xs,
  },
});