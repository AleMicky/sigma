import { Ionicons } from "@expo/vector-icons";
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

export type DateInputProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  onPress: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function DateInput({
  label,
  value,
  placeholder = "Seleccione una fecha",
  error,
  hint,
  disabled = false,
  onPress,
  containerStyle,
  inputStyle,
  labelStyle,
}: DateInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

      <Pressable
        accessibilityRole="button"
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
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.textSecondary}
          style={styles.icon}
        />

        <Text
          numberOfLines={1}
          style={[styles.value, !value && styles.placeholder]}
        >
          {value || placeholder}
        </Text>
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
    backgroundColor: colors.background,
  },
  icon: {
    marginRight: spacing.sm,
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