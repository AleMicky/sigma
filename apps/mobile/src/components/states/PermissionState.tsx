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

export type PermissionStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  badgeText?: string;
  title?: string;
  message?: string;
  buttonText?: string;
  onPress?: () => void;
  loading?: boolean;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  variant?: "fullscreen" | "card";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function PermissionState({
  icon = "lock-closed-outline",
  iconColor = colors.primary,
  iconBgColor = colors.primaryLight,
  badgeText = "PERMISOS REQUERIDOS",
  title = "Permiso requerido",
  message = "La aplicación necesita autorización para acceder a esta función del dispositivo.",
  buttonText = "Permitir acceso",
  onPress,
  loading = false,
  secondaryButtonText,
  onSecondaryPress,
  variant = "card",
  style,
  testID,
}: PermissionStateProps) {
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
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={40} color={iconColor} />
      </View>

      {badgeText ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        {onPress ? (
          <AppButton
            title={buttonText}
            variant="primary"
            size="md"
            loading={loading}
            onPress={onPress}
            style={styles.btn}
          />
        ) : null}

        {secondaryButtonText && onSecondaryPress ? (
          <AppButton
            title={secondaryButtonText}
            variant="ghost"
            size="md"
            onPress={onSecondaryPress}
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
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