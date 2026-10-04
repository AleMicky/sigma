import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, spacing, typography, type ColorKey } from "../../theme";

export type LoadingProps = {
  /** Mensaje opcional debajo del spinner */
  message?: string;
  /** Tamaño del ActivityIndicator */
  size?: "small" | "large";
  /** Color del spinner (clave del theme o hex) */
  color?: ColorKey | (string & {});
  /** Si es true, se renderiza como overlay flotante semitransparente */
  overlay?: boolean;
  /** Si es false, no ocupa flex: 1 (ideal para bloques inline) */
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Loading({
  message,
  size = "large",
  color = "primary",
  overlay = false,
  fullScreen = true,
  style,
  textStyle,
}: LoadingProps) {
  const resolvedColor = colors[color as ColorKey] ?? color;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? "Cargando..."}
      style={[
        styles.base,
        fullScreen && !overlay && styles.fullScreen,
        overlay && styles.overlay,
        style,
      ]}
    >
      <ActivityIndicator size={size} color={resolvedColor} />
      {message ? (
        <Text style={[styles.message, textStyle]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    zIndex: 999,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
});