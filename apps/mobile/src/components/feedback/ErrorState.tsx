import { Ionicons } from "@expo/vector-icons";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { AppButton } from "@/components/ui/AppButton";
import { colors, spacing, typography } from "@/theme";

export type ErrorStateProps = {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  retryLabel?: string;
  onRetry?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
};

export function ErrorState({
  title = "Ocurrió un error",
  message = "No se pudo cargar la información.",
  icon = "alert-circle-outline",
  retryLabel = "Reintentar",
  onRetry,
  secondaryActionLabel,
  onSecondaryAction,
  fullScreen = true,
  style,
  titleStyle,
  messageStyle,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={colors.danger} />
      </View>

      <Text style={[styles.title, titleStyle]}>{title}</Text>

      <Text style={[styles.message, messageStyle]}>{message}</Text>

      {onRetry || onSecondaryAction ? (
        <View style={styles.actions}>
          {onSecondaryAction && secondaryActionLabel ? (
            <AppButton
              title={secondaryActionLabel}
              variant="outline"
              size="sm"
              onPress={onSecondaryAction}
            />
          ) : null}

          {onRetry ? (
            <AppButton
              title={retryLabel}
              variant="danger"
              size="sm"
              onPress={onRetry}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.xs,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});