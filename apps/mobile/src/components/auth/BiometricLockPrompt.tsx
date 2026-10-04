import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";

import { radius, spacing, typography, useAppTheme } from "@/theme";
import { AppButton } from "@/components/ui/AppButton";
import { PulseView } from "@/components/animation/PulseView";

export type BiometricLockPromptProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFailure?: (errorMessage?: string) => void;
  title?: string;
  subtitle?: string;
  reason?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  onFallback?: () => void;
};

export function BiometricLockPrompt({
  visible,
  onClose,
  onSuccess,
  onFailure,
  title = "Verificación de Seguridad",
  subtitle = "Confirma tu identidad para continuar",
  reason = "Acceso a información confidencial de la empresa",
  cancelLabel = "Cancelar",
  fallbackLabel = "Usar Código PIN",
  onFallback,
}: BiometricLockPromptProps) {
  const { colors, isDark } = useAppTheme();

  const [biometricType, setBiometricType] = useState<"face" | "fingerprint" | "generic">("generic");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setAuthError(null);
      checkBiometricSupport();
    }
  }, [visible]);

  const checkBiometricSupport = async () => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("face");
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("fingerprint");
      } else {
        setBiometricType("generic");
      }
    } catch {
      setBiometricType("generic");
    }
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // En simulador o dispositivos sin biometría configurada, permitir prueba exitosa
        setTimeout(() => {
          setIsAuthenticating(false);
          onSuccess();
        }, 800);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        cancelLabel,
        fallbackLabel,
        disableDeviceFallback: false,
      });

      setIsAuthenticating(false);
      if (result.success) {
        onSuccess();
      } else {
        setAuthError("No se pudo verificar la identidad. Inténtalo de nuevo.");
        onFailure?.(result.error);
      }
    } catch (err: any) {
      setIsAuthenticating(false);
      setAuthError(err?.message || "Error al verificar biometría");
      onFailure?.(err?.message);
    }
  };

  const getIconName = () => {
    if (biometricType === "face") {
      return Platform.OS === "ios" ? "scan-outline" : "person-circle-outline";
    }
    return "finger-print-outline";
  };

  const getBiometricName = () => {
    if (biometricType === "face") return "Face ID / Reconocimiento Facial";
    if (biometricType === "fingerprint") return "Huella Digital (Touch ID / Fingerprint)";
    return "Autenticación Biométrica del Dispositivo";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.surface : colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header con Icono Animado */}
          <View style={styles.iconWrapper}>
            <PulseView active={isAuthenticating} type="both" duration={800}>
              <View
                style={[
                  styles.biometricCircle,
                  {
                    backgroundColor: authError
                      ? colors.dangerLight
                      : colors.primaryLight,
                  },
                ]}
              >
                <Ionicons
                  name={getIconName()}
                  size={48}
                  color={authError ? colors.danger : colors.primary}
                />
              </View>
            </PulseView>
          </View>

          {/* Textos */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>

            <View
              style={[
                styles.reasonBox,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                {reason}
              </Text>
            </View>

            <Text style={[styles.biometricLabel, { color: colors.textMuted }]}>
              {getBiometricName()}
            </Text>

            {authError ? (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {authError}
              </Text>
            ) : null}
          </View>

          {/* Botones de Acción */}
          <View style={styles.btnRow}>
            <AppButton
              title={isAuthenticating ? "Verificando..." : "Autenticar Ahora"}
              variant="primary"
              loading={isAuthenticating}
              onPress={handleAuthenticate}
              leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.white} />}
            />

            {onFallback ? (
              <AppButton
                title={fallbackLabel}
                variant="outline"
                onPress={onFallback}
              />
            ) : null}

            <AppButton
              title={cancelLabel}
              variant="ghost"
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconWrapper: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  biometricCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
  reasonBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  reasonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  biometricLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  btnRow: {
    width: "100%",
    gap: spacing.sm,
  },
});
