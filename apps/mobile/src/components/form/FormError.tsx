import { Ionicons } from "@expo/vector-icons";
import { type FieldError } from "react-hook-form";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, spacing, typography } from "@/theme";

export type FormErrorProps = {
  error?: string | FieldError | null;
  message?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function FormError({ error, message, style, textStyle }: FormErrorProps) {
  const resolvedError = error ?? message;
  const errorMessage =
    typeof resolvedError === "string" ? resolvedError : resolvedError?.message;

  if (!errorMessage) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="alert-circle"
        size={16}
        color={colors.danger}
        style={styles.icon}
      />
      <Text style={[styles.error, textStyle]}>{errorMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  icon: {
    marginRight: spacing.xs,
  },
  error: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.danger,
    fontWeight: typography.fontWeight.medium,
  },
});