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

import { colors, radius, spacing, typography } from "@/theme";
import { AppBadge, BadgeAppearance, BadgeVariant } from "../ui/AppBadge";

export type DrawerItemProps = {
  label: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap | ReactNode;
  iconSize?: number;
  active?: boolean;
  disabled?: boolean;
  badge?: string | number;
  badgeVariant?: BadgeVariant;
  badgeAppearance?: BadgeAppearance;
  badgeDot?: boolean;
  right?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  activeBackgroundColor?: string;
  testID?: string;
  accessibilityLabel?: string;
};

export function DrawerItem({
  label,
  subtitle,
  icon,
  iconSize = 22,
  active = false,
  disabled = false,
  badge,
  badgeVariant = "primary",
  badgeAppearance = "subtle",
  badgeDot = false,
  right,
  showChevron = false,
  onPress,
  style,
  labelStyle,
  subtitleStyle,
  activeBackgroundColor,
  testID,
  accessibilityLabel,
}: DrawerItemProps) {
  const iconColor = active
    ? colors.primary
    : disabled
      ? colors.textMuted
      : colors.textSecondary;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return (
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={iconSize}
          color={iconColor}
        />
      );
    }
    return <View style={styles.customIconContainer}>{icon}</View>;
  };

  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.container,
        active && [
          styles.active,
          activeBackgroundColor ? { backgroundColor: activeBackgroundColor } : null,
        ],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {renderIcon()}

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.label,
            active && styles.labelActive,
            disabled && styles.labelDisabled,
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              disabled && styles.labelDisabled,
              subtitleStyle,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {badge !== undefined && badge !== null ? (
        <AppBadge
          label={String(badge)}
          variant={badgeVariant}
          appearance={badgeAppearance}
          dot={badgeDot}
          size="sm"
        />
      ) : null}

      {right ? <View style={styles.rightContainer}>{right}</View> : null}

      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={disabled ? colors.textMuted : colors.textSecondary}
          style={styles.chevron}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  active: {
    backgroundColor: colors.primaryLight,
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: colors.surfaceSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
  customIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    color: colors.text,
    fontWeight: typography.fontWeight.regular,
  },
  labelActive: {
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.semibold,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rightContainer: {
    marginLeft: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});