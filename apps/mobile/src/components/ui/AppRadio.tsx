import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { spacing, typography, useAppTheme } from "@/theme";

export type AppRadioProps = {
  label?: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppRadio({
  label,
  description,
  selected,
  onPress,
  disabled = false,
  style,
}: AppRadioProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          styles.radio,
          {
            backgroundColor: colors.background,
            borderColor: selected ? colors.primary : colors.borderDark,
          },
        ]}
      >
        {selected ? (
          <View style={[styles.inner, { backgroundColor: colors.primary }]} />
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
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
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