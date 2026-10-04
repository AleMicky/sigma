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

export type UnauthorizedStateProps = {
  title?: string;
  message?: string;
  code?: string;
  onBack?: () => void;
  backLabel?: string;
  onRequestAccess?: () => void;
  requestLabel?: string;
  variant?: "fullscreen" | "card";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function UnauthorizedState({
  title = "Acceso Restringido",
  message = "No tienes los permisos requeridos para ver este módulo o ejecutar esta acción. Contacta a un administrador del sistema.",
  code = "403 PROHIBITED",
  onBack,
  backLabel = "Regresar al Inicio",
  onRequestAccess,
  requestLabel = "Solicitar Permiso",
  variant = "card",
  style,
  testID,
}: UnauthorizedStateProps) {
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
        <Ionicons name="shield-outline" size={42} color={colors.danger} />
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

        {onRequestAccess ? (
          <AppButton
            title={requestLabel}
            variant="secondary"
            size="md"
            onPress={onRequestAccess}
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
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
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
    backgroundColor: colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  codeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  codeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.danger,
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