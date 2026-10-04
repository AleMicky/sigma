import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type FilterChipSize = "sm" | "md" | "lg";
export type FilterChipVariant = "subtle" | "solid" | "outline";

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number | string;
  removable?: boolean;
  onRemove?: () => void;
  size?: FilterChipSize;
  variant?: FilterChipVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function FilterChip({
  label,
  selected = false,
  onPress,
  icon,
  count,
  removable = false,
  onRemove,
  size = "md",
  variant = "subtle",
  disabled = false,
  style,
  testID,
}: FilterChipProps) {
  const isSolid = variant === "solid";

  const getContainerStyle = () => {
    if (disabled) {
      return [styles.container, styles.disabled];
    }

    if (selected) {
      if (isSolid) {
        return [styles.container, styles.solidSelected];
      }
      return [styles.container, styles.subtleSelected];
    }

    return [styles.container, styles.unselected];
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (selected) {
      return isSolid ? colors.white : colors.primary;
    }
    return colors.text;
  };

  const getIconColor = () => {
    if (disabled) return colors.textMuted;
    if (selected) {
      return isSolid ? colors.white : colors.primary;
    }
    return colors.textSecondary;
  };

  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const textColor = getTextColor();
  const iconColor = getIconColor();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${label}${count !== undefined ? ` (${count})` : ""}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        getContainerStyle(),
        styles[`size_${size}`],
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={iconSize}
          color={iconColor}
          style={styles.leadingIcon}
        />
      ) : null}

      <Text
        numberOfLines={1}
        style={[
          styles.text,
          styles[`text_${size}`],
          { color: textColor },
          selected && styles.selectedText,
        ]}
      >
        {label}
      </Text>

      {count !== undefined ? (
        <View
          style={[
            styles.badge,
            selected
              ? isSolid
                ? styles.badgeSolidSelected
                : styles.badgeSubtleSelected
              : styles.badgeUnselected,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: selected
                  ? isSolid
                    ? colors.primary
                    : colors.primary
                  : colors.textSecondary,
              },
            ]}
          >
            {count}
          </Text>
        </View>
      ) : null}

      {removable && selected && onRemove ? (
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Quitar filtro ${label}`}
          style={styles.removeBtn}
        >
          <Ionicons
            name="close-circle"
            size={iconSize}
            color={isSolid ? colors.white : colors.primary}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    borderWidth: 1,
  },
  unselected: {
    backgroundColor: colors.background,
    borderColor: colors.borderDark,
  },
  subtleSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  solidSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.75,
  },

  /* SIZES */
  size_sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    minHeight: 28,
    gap: 4,
  },
  size_md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
    gap: 6,
  },
  size_lg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    gap: spacing.xs,
  },

  /* TEXT */
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  text_sm: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  text_md: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  text_lg: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  selectedText: {
    fontWeight: typography.fontWeight.semibold,
  },
  leadingIcon: {
    marginRight: 1,
  },

  /* BADGE COUNT */
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 18,
  },
  badgeUnselected: {
    backgroundColor: colors.surfaceSecondary,
  },
  badgeSubtleSelected: {
    backgroundColor: colors.white,
  },
  badgeSolidSelected: {
    backgroundColor: colors.white,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  removeBtn: {
    marginLeft: 2,
  },
});