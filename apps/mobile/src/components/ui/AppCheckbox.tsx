import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { radius, spacing, typography, useAppTheme } from "@/theme";

export type AppCheckboxProps = {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppCheckbox({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  style,
}: AppCheckboxProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.primary : colors.background,
            borderColor: checked ? colors.primary : colors.borderDark,
          },
        ]}
      >
        {checked ? (
          <Ionicons name="checkmark" size={15} color={colors.white} />
        ) : null}
      </View>

      {label || description ? (
        <View style={styles.textContainer}>
          {label ? (
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          ) : null}
          {description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + 2,
  },
  box: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
  },
  description: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});