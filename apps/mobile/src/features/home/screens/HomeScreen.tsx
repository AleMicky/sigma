import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppCard } from "@/components/ui/AppCard";
import { AppIconButton } from "@/components/ui/AppIconButton";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/layout/Screen";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { permissionService } from "@/services/permission.service";
import { radius, shadows, spacing, useAppTheme } from "@/theme";

export function HomeScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const user = useAuthStore((s) => s.user);

  const [hasGps, setHasGps] = useState<boolean | null>(null);

  useEffect(() => {
    checkGps();
  }, []);

  const checkGps = async () => {
    try {
      const response = await permissionService.getLocationStatus();
      setHasGps(response.granted);
    } catch {
      setHasGps(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar tu sesión en SIGMA?",
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

  const displayName = user?.name || user?.username || "Usuario";
  const userRole = user?.roles?.[0] || user?.department || "Operaciones";

  return (
    <Screen scrollable withPadding={false}>
      {/* Header Superior */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <AppAvatar
            name={displayName}
            size="md"
          />
          <View style={styles.userTextWrapper}>
            <AppText variant="caption" color="textMuted">
              Bienvenido a SIGMA
            </AppText>
            <AppText variant="subtitle" weight="bold" numberOfLines={1}>
              {displayName}
            </AppText>
            <AppBadge
              label={userRole}
              variant="primary"
              size="sm"
              appearance="subtle"
              style={styles.roleBadge}
            />
          </View>
        </View>

        <View style={styles.headerActions}>
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
          <View style={shadows.sm}>
            <AppIconButton
              icon="log-out-outline"
              variant="tonal"
              size="sm"
              color={colors.danger}
              onPress={handleLogout}
              accessibilityLabel="Cerrar sesión"
            />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Banner de Estado GPS */}
        <AppCard
          variant="filled"
          padding="md"
          style={[
            styles.gpsCard,
            {
              backgroundColor:
                hasGps
                  ? isDark
                    ? "#064E3B"
                    : "#DCFCE7"
                  : isDark
                    ? "#450A0A"
                    : "#FEE2E2",
              borderColor: hasGps ? colors.success : colors.danger,
            },
          ]}
        >
          <View style={styles.gpsRow}>
            <View
              style={[
                styles.gpsIconCircle,
                {
                  backgroundColor: hasGps
                    ? isDark
                      ? "#047857"
                      : "#BBF7D0"
                    : isDark
                      ? "#7F1D1D"
                      : "#FECACA",
                },
              ]}
            >
              <Ionicons
                name={hasGps ? "location-outline" : "location-outline"}
                size={20}
                color={hasGps ? colors.success : colors.danger}
              />
            </View>

            <View style={styles.gpsTextWrapper}>
              <AppText
                variant="bodySm"
                weight="bold"
                style={{
                  color: hasGps
                    ? isDark
                      ? "#86EFAC"
                      : "#15803D"
                    : colors.danger,
                }}
              >
                {hasGps ? "Geolocalización Activa" : "GPS no Configurado"}
              </AppText>
              <AppText variant="caption" color="textSecondary">
                {hasGps
                  ? "Listo para validar solicitudes con coordenadas"
                  : "Presiona aquí para configurar el GPS"}
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(ROUTES.APP.WELCOME as any)}
              style={styles.gpsActionBtn}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={{
                  color: hasGps ? colors.primary : colors.danger,
                }}
              >
                {hasGps ? "Ver" : "Configurar"}
              </AppText>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={hasGps ? colors.primary : colors.danger}
              />
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Resumen Operativo / KPIs */}
        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold">
            Resumen Operativo
          </AppText>
          <AppText variant="caption" color="textMuted">
            Actividad reciente
          </AppText>
        </View>

        <View style={styles.statsGrid}>
          <AppCard variant="elevated" padding="md" style={styles.statCard}>
            <View style={styles.statTop}>
              <View
                style={[
                  styles.statIconWrapper,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <AppText variant="title" weight="bold">
                12
              </AppText>
            </View>
            <AppText variant="caption" color="textSecondary" weight="medium">
              Total Solicitudes
            </AppText>
          </AppCard>

          <AppCard variant="elevated" padding="md" style={styles.statCard}>
            <View style={styles.statTop}>
              <View
                style={[
                  styles.statIconWrapper,
                  { backgroundColor: isDark ? "#78350F" : "#FEF3C7" },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.warning}
                />
              </View>
              <AppText variant="title" weight="bold">
                3
              </AppText>
            </View>
            <AppText variant="caption" color="textSecondary" weight="medium">
              Pendientes
            </AppText>
          </AppCard>

          <AppCard variant="elevated" padding="md" style={styles.statCard}>
            <View style={styles.statTop}>
              <View
                style={[
                  styles.statIconWrapper,
                  { backgroundColor: isDark ? "#064E3B" : "#DCFCE7" },
                ]}
              >
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={18}
                  color={colors.success}
                />
              </View>
              <AppText variant="title" weight="bold">
                9
              </AppText>
            </View>
            <AppText variant="caption" color="textSecondary" weight="medium">
              Aprobadas
            </AppText>
          </AppCard>
        </View>

        {/* Módulos Principales / Acciones Rápidas */}
        <View style={styles.sectionHeader}>
          <AppText variant="title" weight="bold">
            Módulos y Acciones
          </AppText>
        </View>

        <View style={styles.modulesGrid}>
          <AppCard
            variant="elevated"
            padding="lg"
            style={styles.moduleCard}
            onPress={() => {
              Alert.alert(
                "Nueva Solicitud",
                "El módulo de creación de solicitudes se abrirá a continuación."
              );
            }}
          >
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={28}
                color={colors.primary}
              />
            </View>
            <View style={styles.moduleText}>
              <AppText variant="body" weight="bold">
                Nueva Solicitud
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Registrar trámite en terreno
              </AppText>
            </View>
          </AppCard>

          <AppCard
            variant="elevated"
            padding="lg"
            style={styles.moduleCard}
            onPress={() => {
              Alert.alert(
                "Mis Solicitudes",
                "Consulta de solicitudes registradas."
              );
            }}
          >
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
              ]}
            >
              <Ionicons
                name="list-outline"
                size={28}
                color={colors.text}
              />
            </View>
            <View style={styles.moduleText}>
              <AppText variant="body" weight="bold">
                Mis Solicitudes
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Historial y seguimiento
              </AppText>
            </View>
          </AppCard>

          <AppCard
            variant="elevated"
            padding="lg"
            style={styles.moduleCard}
            onPress={() => router.push(ROUTES.APP.WELCOME as any)}
          >
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: isDark ? "#064E3B" : "#DCFCE7" },
              ]}
            >
              <Ionicons
                name="navigate-outline"
                size={28}
                color={colors.success}
              />
            </View>
            <View style={styles.moduleText}>
              <AppText variant="body" weight="bold">
                Geolocalización GPS
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Permisos y coordenadas
              </AppText>
            </View>
          </AppCard>

          <AppCard
            variant="elevated"
            padding="lg"
            style={styles.moduleCard}
            onPress={() => router.push(ROUTES.AUTH.SERVER_CONFIG as any)}
          >
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: isDark ? "#312E81" : "#EEF2FF" },
              ]}
            >
              <Ionicons
                name="server-outline"
                size={28}
                color={colors.primaryDark}
              />
            </View>
            <View style={styles.moduleText}>
              <AppText variant="body" weight="bold">
                Configuración Servidor
              </AppText>
              <AppText variant="caption" color="textSecondary">
                Endpoint y conectividad
              </AppText>
            </View>
          </AppCard>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  userTextWrapper: {
    flex: 1,
    gap: 2,
  },
  roleBadge: {
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  gpsCard: {
    borderWidth: 1,
  },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  gpsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  gpsTextWrapper: {
    flex: 1,
    gap: 2,
  },
  gpsActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    gap: spacing.xs,
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  moduleCard: {
    width: "47.5%",
    minHeight: 120,
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleText: {
    gap: 2,
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
});
