import {
  Platform,
  StyleProp,
  StyleSheet,
  Switch,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { spacing, typography, useAppTheme } from "@/theme";

export type AppSwitchProps = {
  label?: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppSwitch({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  style,
}: AppSwitchProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, disabled && styles.disabled, style]}>
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

      <Switch
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border,
          true: colors.primary,
        }}
        thumbColor={
          Platform.OS === "android"
            ? value
              ? colors.primaryDark
              : colors.surfaceSecondary
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.medium,
  },
  description: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});