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
import { Ionicons } from "@expo/vector-icons";

import { radius, spacing, typography, useAppTheme } from "@/theme";
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
  const { colors, isDark } = useAppTheme();

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
          { backgroundColor: activeBackgroundColor || (isDark ? colors.surfaceSecondary : colors.primaryLight) },
        ],
        disabled && styles.disabled,
        pressed && !disabled && [styles.pressed, { backgroundColor: colors.surfaceSecondary }],
        style,
      ]}
    >
      {renderIcon()}

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.label,
            { color: colors.text },
            active && [styles.labelActive, { color: isDark ? colors.primary : colors.primaryDark }],
            disabled && { color: colors.textMuted },
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
              { color: colors.textSecondary },
              disabled && { color: colors.textMuted },
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
  pressed: {
    opacity: 0.75,
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
    fontWeight: typography.fontWeight.regular,
  },
  labelActive: {
    fontWeight: typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    marginTop: 1,
  },
  rightContainer: {
    marginLeft: spacing.xs,
  },
  chevron: {
    marginLeft: spacing.xs,
  },
});