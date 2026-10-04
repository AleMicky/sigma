import {
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import { colors, radius, shadows, spacing } from "../../theme";

export type CardVariant = "outlined" | "elevated" | "filled";

export type AppCardProps = ViewProps & {
  variant?: CardVariant;
  padding?: keyof typeof spacing;
};

export function AppCard({
  variant = "outlined",
  padding = "lg",
  style,
  ...props
}: AppCardProps) {
  return (
    <View
      style={[
        styles.card,
        styles[variant],
        { padding: spacing[padding] },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.surface,
  },
});