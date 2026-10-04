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
import { colors, radius, spacing, typography } from "@/theme";

export type SelectInputProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function SelectInput({
  label,
  value,
  placeholder = "Seleccione una opción",
  error,
  hint,
  disabled = false,
  leftIcon,
  rightIcon,
  onPress,
  containerStyle,
  inputStyle,
  labelStyle,
}: SelectInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.input,
          disabled && styles.disabledInput,
          error ? styles.inputError : null,
          pressed && styles.pressed,
          inputStyle,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

        <Text
          numberOfLines={1}
          style={[styles.value, !value && styles.placeholder]}
        >
          {value || placeholder}
        </Text>

        {rightIcon ?? (
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.textSecondary}
          />
        )}
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
  },
  pressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  disabledInput: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
  },
  error: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.danger,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
});