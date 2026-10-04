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
import { AppButton } from "./AppButton";
import { colors, radius, spacing, typography } from "@/theme";

export type ErrorMessageVariant = "banner" | "card";

export type ErrorMessageProps = {
  title?: string;
  message?: string;
  variant?: ErrorMessageVariant;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function ErrorMessage({
  title,
  message = "Ocurrió un error inesperado.",
  variant = "banner",
  onRetry,
  retryLabel = "Reintentar",
  style,
  textStyle,
}: ErrorMessageProps) {
  if (variant === "card") {
    return (
      <View style={[styles.cardContainer, style]}>
        <View style={styles.cardIconCircle}>
          <Ionicons name="alert-circle" size={36} color={colors.danger} />
        </View>

        {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
        <Text style={[styles.cardMessage, textStyle]}>{message}</Text>

        {onRetry ? (
          <AppButton
            title={retryLabel}
            variant="danger"
            size="sm"
            onPress={onRetry}
            style={styles.retryBtn}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.bannerContainer, style]}>
      <Ionicons
        name="alert-circle"
        size={20}
        color={colors.danger}
        style={styles.bannerIcon}
      />
      <View style={styles.bannerContent}>
        {title ? <Text style={styles.bannerTitle}>{title}</Text> : null}
        <Text style={[styles.bannerMessage, textStyle]}>{message}</Text>
      </View>

      {onRetry ? (
        <Pressable
          hitSlop={8}
          onPress={onRetry}
          style={styles.inlineRetry}
          accessibilityRole="button"
        >
          <Text style={styles.inlineRetryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Banner
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  bannerIcon: {
    marginRight: spacing.sm,
    alignSelf: "flex-start",
    marginTop: 1,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.danger,
    marginBottom: 2,
  },
  bannerMessage: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.danger,
  },
  inlineRetry: {
    marginLeft: spacing.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  inlineRetryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.danger,
    textDecorationLine: "underline",
  },

  // Card
  cardContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  cardMessage: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: spacing.lg,
  },
});