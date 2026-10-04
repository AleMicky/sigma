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
import { radius, spacing, typography, useAppTheme } from "@/theme";

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
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: selected ? colors.primary : colors.surfaceSecondary,
          borderColor: selected ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

      <Text
        style={[
          styles.text,
          { color: selected ? colors.white : colors.text },
          selected && styles.selectedText,
        ]}
      >
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
    borderWidth: 1,
    gap: spacing.xs,
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
    fontWeight: typography.fontWeight.medium,
  },
  selectedText: {
    fontWeight: typography.fontWeight.semibold,
  },
  removeButton: {
    marginLeft: 2,
  },
});