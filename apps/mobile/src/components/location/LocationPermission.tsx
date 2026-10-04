import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { permissionService } from "@/services/permission.service";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

export type LocationPermissionProps = {
  title?: string;
  description?: string;
  onGranted?: (location?: Location.LocationObjectCoords) => void;
  onDenied?: () => void;
  variant?: "card" | "fullscreen";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function LocationPermission({
  title = "Permiso de Ubicación",
  description = "Para validar operaciones en terreno y registrar la ubicación de tus trámites, necesitamos acceso al GPS del dispositivo.",
  onGranted,
  onDenied,
  variant = "card",
  style,
  testID,
}: LocationPermissionProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Location.PermissionStatus | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const response = await permissionService.getLocationStatus();
      setStatus(response.status);
    } catch {
      // ignore
    }
  };

  const handleRequestPermission = async () => {
    try {
      setLoading(true);

      const response = await permissionService.requestLocation();
      setStatus(response.status);

      if (response.granted) {
        const coords = await permissionService.getCurrentPosition();
        onGranted?.(coords ?? undefined);
      } else {
        onDenied?.();
        if (response.status === Location.PermissionStatus.DENIED) {
          Alert.alert(
            "Permiso denegado",
            "Puedes habilitar la ubicación en cualquier momento desde los ajustes de la aplicación.",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Abrir Ajustes",
                onPress: () => permissionService.openSettings(),
              },
            ]
          );
        }
      }
    } catch {
      Alert.alert("Error", "No se pudo solicitar el permiso de ubicación.");
    } finally {
      setLoading(false);
    }
  };

  const isFullscreen = variant === "fullscreen";
  const isGranted = status === Location.PermissionStatus.GRANTED;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        isFullscreen ? styles.fullscreen : styles.card,
        isGranted && styles.grantedCard,
        style,
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          isGranted && { backgroundColor: "#DCFCE7" },
        ]}
      >
        <Ionicons
          name={isGranted ? "checkmark-circle" : "location"}
          size={38}
          color={isGranted ? colors.success : colors.primary}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{isGranted ? "Ubicación Habilitada" : title}</Text>
        <Text style={styles.description}>
          {isGranted
            ? "El acceso al GPS está activo y listo para geolocalizar solicitudes."
            : description}
        </Text>
      </View>

      {!isGranted ? (
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="navigate-outline" size={16} color={colors.primary} />
            <Text style={styles.benefitText}>
              Verificación de punto de entrega / sucursal
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
            <Text style={styles.benefitText}>
              Firma georreferenciada de documentos
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actionContainer}>
        {isGranted ? (
          <View style={styles.grantedBadge}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={styles.grantedBadgeText}>Acceso GPS Autorizado</Text>
          </View>
        ) : (
          <AppButton
            title={loading ? "Obteniendo GPS..." : "Permitir Ubicación"}
            variant="primary"
            size="md"
            loading={loading}
            onPress={handleRequestPermission}
            style={styles.actionBtn}
          />
        )}
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
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  grantedCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  fullscreen: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  textContainer: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: "center",
  },
  description: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 300,
  },
  benefitsList: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  benefitText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    flex: 1,
  },
  actionContainer: {
    width: "100%",
    marginTop: spacing.xs,
  },
  actionBtn: {
    width: "100%",
  },
  grantedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: "#DCFCE7",
  },
  grantedBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
});