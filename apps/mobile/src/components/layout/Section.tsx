import { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { colors, spacing, typography, type SpacingKey } from "@/theme";
import { Divider } from "@/components/ui/Divider";

export type SectionProps = ViewProps & {
  title?: string;
  description?: string;
  rightAction?: ReactNode;
  gap?: SpacingKey;
  withDivider?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  headerStyle?: StyleProp<ViewStyle>;
};

export function Section({
  title,
  description,
  rightAction,
  gap = "md",
  withDivider = false,
  titleStyle,
  descriptionStyle,
  headerStyle,
  children,
  style,
  ...props
}: SectionProps) {
  return (
    <View style={[styles.container, { gap: spacing[gap] }, style]} {...props}>
      {title || rightAction ? (
        <View style={[styles.headerRow, headerStyle]}>
          <View style={styles.titleWrapper}>
            {title ? (
              <Text style={[styles.title, titleStyle]}>{title}</Text>
            ) : null}
            {description ? (
              <Text style={[styles.description, descriptionStyle]}>
                {description}
              </Text>
            ) : null}
          </View>

          {rightAction ? (
            <View style={styles.rightAction}>{rightAction}</View>
          ) : null}
        </View>
      ) : null}

      {children}

      {withDivider ? <Divider spacingVertical="lg" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  titleWrapper: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  rightAction: {
    alignSelf: "center",
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
  },
});