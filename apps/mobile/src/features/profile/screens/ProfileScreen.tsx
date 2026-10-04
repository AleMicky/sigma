import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconButton } from "@/components/ui/AppIconButton";
import { AppSwitch } from "@/components/ui/AppSwitch";
import { AppText } from "@/components/ui/AppText";
import { Divider } from "@/components/ui/Divider";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/layout/Screen";
import { ROUTES } from "@/constants/routes";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useNetwork } from "@/hooks/useNetwork";
import { apiConfigService } from "@/services/api-config.service";
import { permissionService } from "@/services/permission.service";
import { storageService } from "@/services/storage.service";
import { radius, shadows, spacing, useAppTheme } from "@/theme";

export function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const { isConnected } = useNetwork();

  // Biometrics state
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometría");
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isVerifyingBiometrics, setIsVerifyingBiometrics] = useState(false);

  // Notification preferences
  const [notifSolicitudes, setNotifSolicitudes] = useState(true);
  const [notifAlertas, setNotifAlertas] = useState(true);
  const [notifSonido, setNotifSonido] = useState(true);

  // Permissions state
  const [gpsGranted, setGpsGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>("");

  useEffect(() => {
    loadPreferencesAndHardware();
  }, []);

  const loadPreferencesAndHardware = async () => {
    // 1. Check Biometrics
    try {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometricHardware(hasHw && isEnrolled);

      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        setBiometricType(Platform.OS === "ios" ? "Face ID" : "Reconocimiento Facial");
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometricType(Platform.OS === "ios" ? "Touch ID" : "Huella Dactilar");
      } else {
        setBiometricType("Biometría");
      }

      const bioSaved = await storageService.get(
        STORAGE_KEYS.BIOMETRICS_ENABLED
      );
      setBiometricsEnabled(bioSaved === "true");
    } catch {
      setHasBiometricHardware(false);
    }

    // 2. Load Notification Preferences
    try {
      const savedNotifSol = await storageService.get(
        STORAGE_KEYS.NOTIFICATIONS_SOLICITUDES
      );
      if (savedNotifSol !== null) setNotifSolicitudes(savedNotifSol === "true");

      const savedNotifAlt = await storageService.get(
        STORAGE_KEYS.NOTIFICATIONS_ALERTS
      );
      if (savedNotifAlt !== null) setNotifAlertas(savedNotifAlt === "true");

      const savedNotifSnd = await storageService.get(
        STORAGE_KEYS.NOTIFICATIONS_SOUND
      );
      if (savedNotifSnd !== null) setNotifSonido(savedNotifSnd === "true");
    } catch {
      // Usar defaults
    }

    // 3. Permissions status
    try {
      const locStatus = await permissionService.getLocationStatus();
      setGpsGranted(locStatus.granted);

      const camStatus = await permissionService.getCameraStatus();
      setCameraGranted(camStatus.granted);
    } catch {
      // Ignorar errores
    }

    // 4. Active API URL
    try {
      const activeUrl = await apiConfigService.getActiveUrl();
      setServerUrl(activeUrl);
    } catch {
      // Default
    }
  };

  const handleToggleBiometrics = async (enabled: boolean) => {
    if (!hasBiometricHardware && enabled) {
      Alert.alert(
        "Biometría no disponible",
        "Tu dispositivo no tiene configurado Face ID o lector de huella dactilar."
      );
      return;
    }

    if (enabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Confirmar ${biometricType} para SIGMA`,
          cancelLabel: "Cancelar",
          disableDeviceFallback: false,
        });

        if (result.success) {
          setBiometricsEnabled(true);
          await storageService.set(
            STORAGE_KEYS.BIOMETRICS_ENABLED,
            "true"
          );
          Alert.alert("Éxito", `${biometricType} habilitado para inicio rápido.`);
        } else {
          setBiometricsEnabled(false);
        }
      } catch {
        setBiometricsEnabled(false);
      }
    } else {
      setBiometricsEnabled(false);
      await storageService.set(
        STORAGE_KEYS.BIOMETRICS_ENABLED,
        "false"
      );
    }
  };

  const handleTestBiometrics = async () => {
    setIsVerifyingBiometrics(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Verificación de Seguridad con ${biometricType}`,
        cancelLabel: "Cancelar",
        disableDeviceFallback: false,
      });

      if (result.success) {
        Alert.alert("Autenticación Exitosa", "Identidad verificada correctamente.");
      } else {
        Alert.alert("Fallo de Autenticación", "No se pudo validar la identidad.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Error al comprobar biometría.");
    } finally {
      setIsVerifyingBiometrics(false);
    }
  };

  const handleToggleNotifSolicitudes = async (val: boolean) => {
    setNotifSolicitudes(val);
    await storageService.set(
      STORAGE_KEYS.NOTIFICATIONS_SOLICITUDES,
      val ? "true" : "false"
    );
  };

  const handleToggleNotifAlertas = async (val: boolean) => {
    setNotifAlertas(val);
    await storageService.set(
      STORAGE_KEYS.NOTIFICATIONS_ALERTS,
      val ? "true" : "false"
    );
  };

  const handleToggleNotifSonido = async (val: boolean) => {
    setNotifSonido(val);
    await storageService.set(
      STORAGE_KEYS.NOTIFICATIONS_SOUND,
      val ? "true" : "false"
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Deseas cerrar tu sesión y salir de la aplicación SIGMA?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            await authService.logout();
            router.replace(ROUTES.AUTH.LOGIN as any);
          },
        },
      ]
    );
  };

  const displayName = user?.name || user?.username || "Usuario de Campo";
  const userRole = user?.roles?.[0] || "Operador SIGMA";
  const department = user?.department || "Operaciones y Mantenimiento";

  return (
    <Screen scrollable withPadding={false}>
      {/* Header con botón de volver */}
      <AppHeader
        title="Mi Perfil"
        subtitle="Configuración y Preferencias"
        showBack
        onBackPress={() => router.back()}
        rightAction={
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
        }
      />

      <View style={styles.container}>
        {/* Banner de Estado de Red / Modo Offline */}
        <AppCard
          variant="filled"
          padding="md"
          style={[
            styles.networkBanner,
            {
              backgroundColor: isConnected
                ? isDark
                  ? "#064E3B"
                  : "#DCFCE7"
                : isDark
                  ? "#78350F"
                  : "#FEF3C7",
              borderColor: isConnected
                ? isDark
                  ? "#047857"
                  : "#BBF7D0"
                : isDark
                  ? "#B45309"
                  : "#FDE68A",
            },
          ]}
        >
          <View style={styles.networkRow}>
            <Ionicons
              name={isConnected ? "wifi" : "cloud-offline-outline"}
              size={22}
              color={
                isConnected
                  ? isDark
                    ? "#4ADE80"
                    : "#15803D"
                  : isDark
                    ? "#FBBF24"
                    : "#B45309"
              }
            />
            <View style={styles.networkTextWrapper}>
              <AppText
                variant="bodySm"
                weight="bold"
                style={{
                  color: isConnected
                    ? isDark
                      ? "#86EFAC"
                      : "#15803D"
                    : isDark
                      ? "#FDE68A"
                      : "#92400E",
                }}
              >
                {isConnected
                  ? "Conectado al Servidor (En Línea)"
                  : "Modo Terreno Desconectado (Offline)"}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {isConnected
                  ? "Sincronización en tiempo real habilitada"
                  : "Operando con datos cacheados localmente"}
              </AppText>
            </View>
            <AppBadge
              label={isConnected ? "Online" : "Offline"}
              variant={isConnected ? "success" : "warning"}
              size="sm"
              dot
            />
          </View>
        </AppCard>

        {/* Tarjeta de Perfil / Credencial Digital */}
        <AppCard variant="elevated" padding="lg" style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <AppAvatar
              name={displayName}
              size="lg"
            />
            <View style={styles.profileTitles}>
              <AppText variant="title" weight="bold" align="center">
                {displayName}
              </AppText>
              <AppText variant="caption" color="textMuted" align="center">
                @{user?.username || "usuario"}
              </AppText>
              <View style={styles.roleWrapper}>
                <AppBadge
                  label={userRole}
                  variant="primary"
                  size="md"
                  appearance="subtle"
                />
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Información Institucional */}
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoTextWrapper}>
                <AppText variant="caption" color="textMuted">
                  Empresa
                </AppText>
                <AppText variant="bodySm" weight="medium">
                  ENDE CORANI S.A.
                </AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons
                  name="briefcase-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoTextWrapper}>
                <AppText variant="caption" color="textMuted">
                  Departamento / Área
                </AppText>
                <AppText variant="bodySm" weight="medium">
                  {department}
                </AppText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View style={styles.infoTextWrapper}>
                <AppText variant="caption" color="textMuted">
                  Correo Corporativo
                </AppText>
                <AppText variant="bodySm" weight="medium">
                  {user?.email || "Sin correo asignado"}
                </AppText>
              </View>
            </View>

            {user?.id ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons
                    name="id-card-outline"
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.infoTextWrapper}>
                  <AppText variant="caption" color="textMuted">
                    Identificador de Usuario
                  </AppText>
                  <AppText variant="bodySm" weight="medium">
                    {user.id}
                  </AppText>
                </View>
              </View>
            ) : null}
          </View>
        </AppCard>

        {/* Sección: Seguridad & Biometría */}
        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold">
            Seguridad & Biometría
          </AppText>
        </View>

        <AppCard variant="elevated" padding="lg" style={styles.sectionCard}>
          <AppSwitch
            label={`Habilitar ${biometricType}`}
            description={`Iniciar sesión y confirmar firmas mediante ${biometricType}`}
            value={biometricsEnabled}
            onValueChange={handleToggleBiometrics}
            disabled={!hasBiometricHardware}
          />

          {biometricsEnabled ? (
            <>
              <Divider style={styles.innerDivider} />
              <View style={styles.biometricActionRow}>
                <AppButton
                  title={`Probar ${biometricType}`}
                  variant="outline"
                  size="sm"
                  loading={isVerifyingBiometrics}
                  onPress={handleTestBiometrics}
                  leftIcon={
                    <Ionicons
                      name="finger-print-outline"
                      size={16}
                      color={colors.primary}
                    />
                  }
                />
              </View>
            </>
          ) : null}

          <Divider style={styles.innerDivider} />

          <View style={styles.securityBadgeRow}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={colors.success}
            />
            <AppText variant="caption" color="textSecondary" style={{ flex: 1 }}>
              Sesión local cifrada con SecureStore / Hardware Keystore.
            </AppText>
          </View>
        </AppCard>

        {/* Sección: Notificaciones & Alertas */}
        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold">
            Notificaciones & Alertas
          </AppText>
        </View>

        <AppCard variant="elevated" padding="lg" style={styles.sectionCard}>
          <AppSwitch
            label="Actualización de Solicitudes"
            description="Avisos sobre cambios de estado y aprobaciones"
            value={notifSolicitudes}
            onValueChange={handleToggleNotifSolicitudes}
          />

          <Divider style={styles.innerDivider} />

          <AppSwitch
            label="Alertas Críticas de Operación"
            description="Notificaciones de alta prioridad en planta y terreno"
            value={notifAlertas}
            onValueChange={handleToggleNotifAlertas}
          />

          <Divider style={styles.innerDivider} />

          <AppSwitch
            label="Sonido y Vibración"
            description="Emitir alerta acústica en avisos urgentes"
            value={notifSonido}
            onValueChange={handleToggleNotifSonido}
          />
        </AppCard>

        {/* Sección: Permisos del Dispositivo */}
        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold">
            Permisos de Hardware
          </AppText>
        </View>

        <AppCard variant="elevated" padding="lg" style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.permissionItem}
            activeOpacity={0.7}
            onPress={() => router.push(ROUTES.APP.WELCOME as any)}
          >
            <View style={styles.permissionLeft}>
              <Ionicons
                name="location-outline"
                size={20}
                color={gpsGranted ? colors.success : colors.danger}
              />
              <View>
                <AppText variant="bodySm" weight="medium">
                  Ubicación GPS
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {gpsGranted ? "Autorizado" : "No concedido"}
                </AppText>
              </View>
            </View>
            <AppBadge
              label={gpsGranted ? "Activo" : "Configurar"}
              variant={gpsGranted ? "success" : "danger"}
              size="sm"
            />
          </TouchableOpacity>

          <Divider style={styles.innerDivider} />

          <View style={styles.permissionItem}>
            <View style={styles.permissionLeft}>
              <Ionicons
                name="camera-outline"
                size={20}
                color={cameraGranted ? colors.success : colors.warning}
              />
              <View>
                <AppText variant="bodySm" weight="medium">
                  Cámara fotográfica
                </AppText>
                <AppText variant="caption" color="textMuted">
                  {cameraGranted ? "Autorizado" : "Solo al requerir foto"}
                </AppText>
              </View>
            </View>
            <AppBadge
              label={cameraGranted ? "Activo" : "Bajo demanda"}
              variant={cameraGranted ? "success" : "default"}
              size="sm"
            />
          </View>

          <Divider style={styles.innerDivider} />

          <AppButton
            title="Abrir Ajustes del Teléfono"
            variant="ghost"
            size="sm"
            onPress={() => permissionService.openSettings()}
            rightIcon={
              <Ionicons
                name="open-outline"
                size={16}
                color={colors.primary}
              />
            }
          />
        </AppCard>

        {/* Sección: Conectividad y Servidor */}
        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold">
            Servidor Backend
          </AppText>
        </View>

        <AppCard variant="elevated" padding="lg" style={styles.sectionCard}>
          <View style={styles.serverRow}>
            <Ionicons name="server-outline" size={20} color={colors.primary} />
            <View style={styles.serverTextWrapper}>
              <AppText variant="caption" color="textMuted">
                Endpoint Activo
              </AppText>
              <AppText variant="bodySm" weight="semibold" numberOfLines={1}>
                {serverUrl || "Predeterminado"}
              </AppText>
            </View>
          </View>

          <AppButton
            title="Cambiar Servidor API"
            variant="outline"
            size="sm"
            style={styles.serverBtn}
            onPress={() => router.push(ROUTES.AUTH.SERVER_CONFIG as any)}
          />
        </AppCard>

        {/* Botón de Cierre de Sesión */}
        <View style={styles.logoutWrapper}>
          <AppButton
            title="Cerrar Sesión"
            variant="danger"
            size="lg"
            onPress={handleLogout}
            leftIcon={
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.white}
              />
            }
          />
        </View>

        {/* Footer Institucional */}
        <View style={styles.footer}>
          <AppText variant="caption" color="textMuted" align="center">
            ENDE CORANI S.A. • SIGMA v1.0.0
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
    gap: spacing.lg,
  },
  networkBanner: {
    borderWidth: 1,
  },
  networkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  networkTextWrapper: {
    flex: 1,
    gap: 2,
  },
  profileCard: {
    gap: spacing.md,
  },
  avatarSection: {
    alignItems: "center",
    gap: spacing.sm,
  },
  profileTitles: {
    alignItems: "center",
    gap: 2,
  },
  roleWrapper: {
    marginTop: spacing.xs,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrapper: {
    flex: 1,
    gap: 1,
  },
  sectionHeader: {
    marginTop: spacing.xs,
  },
  sectionCard: {
    gap: spacing.sm,
  },
  innerDivider: {
    marginVertical: spacing.xs,
  },
  biometricActionRow: {
    alignItems: "flex-start",
  },
  securityBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  permissionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  serverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  serverTextWrapper: {
    flex: 1,
    gap: 2,
  },
  serverBtn: {
    marginTop: spacing.xs,
  },
  logoutWrapper: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.xs,
  },
});
