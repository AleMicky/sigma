import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconButton } from "@/components/ui/AppIconButton";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/layout/Screen";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { permissionService } from "@/services/permission.service";
import { storageService } from "@/services/storage.service";
import { radius, shadows, spacing, useAppTheme } from "@/theme";

type CoordsState = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export function WelcomeLocationScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [coords, setCoords] = useState<CoordsState | null>(null);

  useEffect(() => {
    checkCurrentPermission();
  }, []);

  const checkCurrentPermission = async () => {
    try {
      const response = await permissionService.getLocationStatus();
      setPermissionStatus(response.status);
      if (response.granted) {
        fetchLocationCoords();
      }
    } catch {
      // Ignorar error de lectura inicial
    }
  };

  const fetchLocationCoords = async () => {
    try {
      const position = await permissionService.getCurrentPosition();
      if (position) {
        setCoords({
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
        });
      }
    } catch {
      // Coords opcionales
    }
  };

  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      const response = await permissionService.requestLocation();
      setPermissionStatus(response.status);

      if (response.granted) {
        await storageService.set(
          STORAGE_KEYS.LOCATION_SETUP_COMPLETED,
          "true"
        );
        await fetchLocationCoords();
      } else if (response.status === Location.PermissionStatus.DENIED) {
        Alert.alert(
          "Permiso de Ubicación Denegado",
          "Para registrar inspecciones y firmas en terreno, la aplicación necesita acceso a tu ubicación. Puedes habilitarlo en los ajustes del dispositivo.",
          [
            { text: "Continuar sin GPS", style: "cancel" },
            {
              text: "Abrir Ajustes",
              onPress: () => permissionService.openSettings(),
            },
          ]
        );
      }
    } catch {
      Alert.alert(
        "Error",
        "Ocurrió un error al intentar solicitar el permiso de geolocalización."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    await storageService.set(
      STORAGE_KEYS.LOCATION_SETUP_COMPLETED,
      "true"
    );
    router.replace(ROUTES.APP.HOME as any);
  };

  const isGranted = permissionStatus === Location.PermissionStatus.GRANTED;

  return (
    <Screen scrollable withPadding={false}>
      {/* Barra superior con botón de tema */}
      <View style={styles.topBar}>
        <AppBadge
          label="SIGMA MÓVIL"
          variant="primary"
          size="sm"
          appearance="subtle"
        />
        <View style={shadows.sm}>
          <AppIconButton
            icon={isDark ? "sunny-outline" : "moon-outline"}
            variant="tonal"
            size="sm"
            color={colors.textSecondary}
            onPress={toggleTheme}
            accessibilityLabel="Cambiar tema visual"
          />
        </View>
      </View>

      <View style={styles.content}>
        {/* Encabezado Principal */}
        <View style={styles.headerSection}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isGranted
                  ? isDark
                    ? "#064E3B"
                    : "#DCFCE7"
                  : isDark
                    ? colors.primaryLight
                    : "#EFF6FF",
              },
            ]}
          >
            <Ionicons
              name={isGranted ? "location" : "navigate-circle"}
              size={54}
              color={isGranted ? colors.success : colors.primary}
            />
          </View>

          <View style={styles.titleContainer}>
            <AppText variant="title" weight="bold" align="center">
              ¡Bienvenido{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </AppText>
            <AppText
              variant="body"
              color="textSecondary"
              align="center"
              style={styles.subtitle}
            >
              Configuración de Geolocalización Operativa
            </AppText>
          </View>
        </View>

        {/* Tarjeta de Estado / Permiso */}
        <AppCard
          variant="elevated"
          padding="lg"
          style={[
            styles.card,
            isGranted && {
              borderColor: isDark ? "#065F46" : "#86EFAC",
            },
          ]}
        >
          <View style={styles.statusRow}>
            <View style={styles.statusTextWrapper}>
              <AppText variant="bodySm" weight="semibold">
                Estado del GPS
              </AppText>
              <AppText variant="caption" color="textMuted">
                {isGranted
                  ? "Servicio de ubicación vinculado y activo"
                  : "Se requiere autorización para trámites de campo"}
              </AppText>
            </View>
            <AppBadge
              label={isGranted ? "Habilitado" : "Pendiente"}
              variant={isGranted ? "success" : "warning"}
              size="md"
              dot
            />
          </View>

          {/* Información de Coordenadas si está habilitado */}
          {isGranted && coords ? (
            <View
              style={[
                styles.coordsBox,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : "#F8FAFC",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.coordItem}>
                <AppText variant="caption" color="textMuted">
                  Latitud
                </AppText>
                <AppText variant="bodySm" weight="semibold">
                  {coords.latitude.toFixed(5)}°
                </AppText>
              </View>
              <View style={styles.coordDivider} />
              <View style={styles.coordItem}>
                <AppText variant="caption" color="textMuted">
                  Longitud
                </AppText>
                <AppText variant="bodySm" weight="semibold">
                  {coords.longitude.toFixed(5)}°
                </AppText>
              </View>
              {coords.accuracy !== null && (
                <>
                  <View style={styles.coordDivider} />
                  <View style={styles.coordItem}>
                    <AppText variant="caption" color="textMuted">
                      Precisión
                    </AppText>
                    <AppText variant="bodySm" weight="semibold">
                      ±{Math.round(coords.accuracy)}m
                    </AppText>
                  </View>
                </>
              )}
            </View>
          ) : null}

          {/* Lista de Beneficios / Requisitos */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIconBubble,
                  { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureTextWrapper}>
                <AppText variant="bodySm" weight="medium">
                  Validación de Firmas y Solicitudes
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Garantiza la validez legal y auditoría de los registros.
                </AppText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIconBubble,
                  { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                ]}
              >
                <Ionicons
                  name="map-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.featureTextWrapper}>
                <AppText variant="bodySm" weight="medium">
                  Georreferenciación en Terreno
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  Asocia automáticamente las coordenadas de ENDE CORANI.
                </AppText>
              </View>
            </View>
          </View>
        </AppCard>

        {/* Acciones principales */}
        <View style={styles.actionSection}>
          {isGranted ? (
            <AppButton
              title="Continuar al Inicio"
              size="lg"
              variant="primary"
              onPress={handleContinue}
              rightIcon={
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.white}
                />
              }
            />
          ) : (
            <>
              <AppButton
                title={loading ? "Verificando GPS..." : "Habilitar Ubicación"}
                size="lg"
                variant="primary"
                loading={loading}
                disabled={loading}
                onPress={handleRequestPermission}
                leftIcon={
                  !loading ? (
                    <Ionicons
                      name="location-sharp"
                      size={18}
                      color={colors.white}
                    />
                  ) : undefined
                }
              />
              <AppButton
                title="Configurar más tarde"
                size="md"
                variant="ghost"
                onPress={handleContinue}
                disabled={loading}
                style={styles.skipButton}
              />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    gap: spacing.lg,
  },
  headerSection: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    gap: 4,
  },
  subtitle: {
    maxWidth: 320,
    marginTop: 2,
  },
  card: {
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTextWrapper: {
    flex: 1,
    gap: 2,
    marginRight: spacing.sm,
  },
  coordsBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  coordItem: {
    alignItems: "center",
    gap: 2,
  },
  coordDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#CBD5E1",
  },
  featuresList: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  featureIconBubble: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTextWrapper: {
    flex: 1,
    gap: 2,
  },
  actionSection: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  skipButton: {
    alignSelf: "center",
  },
});
