import { Ionicons } from "@expo/vector-icons";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type NotFoundStateProps = {
  title?: string;
  message?: string;
  code?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
  backLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "fullscreen" | "card";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function NotFoundState({
  title = "Elemento no encontrado",
  message = "La información, solicitud o registro que buscas no existe o ha sido movido a otra ubicación.",
  code = "404 NOT FOUND",
  icon = "search-outline",
  onBack,
  backLabel = "Volver a la Lista",
  onRetry,
  retryLabel = "Reintentar Búsqueda",
  variant = "card",
  style,
  testID,
}: NotFoundStateProps) {
  const isFullscreen = variant === "fullscreen";

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        isFullscreen ? styles.fullscreen : styles.card,
        style,
      ]}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={42} color={colors.textSecondary} />
      </View>

      {code ? (
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{code}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        {onBack ? (
          <AppButton
            title={backLabel}
            variant="primary"
            size="md"
            onPress={onBack}
            style={styles.btn}
          />
        ) : null}

        {onRetry ? (
          <AppButton
            title={retryLabel}
            variant="secondary"
            size="md"
            onPress={onRetry}
            style={styles.btn}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  card: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  fullscreen: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  codeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 320,
    marginBottom: spacing.xs,
  },
  actions: {
    width: "100%",
    maxWidth: 280,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  btn: {
    width: "100%",
  },
});