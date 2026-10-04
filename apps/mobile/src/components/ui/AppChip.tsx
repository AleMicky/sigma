import { Ionicons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, typography } from "@/theme";

export type AppChipProps = {
  label: string;
  selected?: boolean;
  leftIcon?: ReactNode;
  onPress?: () => void;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppChip({
  label,
  selected = false,
  leftIcon,
  onPress,
  onRemove,
  style,
}: AppChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>

      {onRemove ? (
        <Pressable
          hitSlop={8}
          onPress={onRemove}
          style={styles.removeButton}
          accessibilityLabel={`Eliminar filtro ${label}`}
        >
          <Ionicons
            name="close-circle"
            size={16}
            color={selected ? colors.white : colors.textSecondary}
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
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  leftIcon: {
    marginRight: 2,
  },
  text: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  selectedText: {
    color: colors.white,
  },
  removeButton: {
    marginLeft: 2,
  },
});