import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, shadows, spacing, typography } from "@/theme";

export type ListItemVariant = "card" | "flat" | "bordered";

export type ListItemProps = {
  title: string;
  subtitle?: string;
  caption?: string;
  left?: ReactNode;
  right?: ReactNode;
  variant?: ListItemVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

export function ListItem({
  title,
  subtitle,
  caption,
  left,
  right,
  variant = "bordered",
  onPress,
  style,
  titleStyle,
}: ListItemProps) {
  const isClickable = !!onPress;

  const defaultRight = isClickable ? (
    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
  ) : null;

  return (
    <Pressable
      accessibilityRole={isClickable ? "button" : undefined}
      onPress={onPress}
      disabled={!isClickable}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && isClickable && styles.pressed,
        style,
      ]}
    >
      {left ? <View style={styles.left}>{left}</View> : null}

      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.title, titleStyle]}>
          {title}
        </Text>

        {subtitle ? (
          <Text numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}

        {caption ? (
          <Text numberOfLines={1} style={styles.caption}>
            {caption}
          </Text>
        ) : null}
      </View>

      {right ?? defaultRight}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  card: {
    borderRadius: radius.lg,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  left: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});