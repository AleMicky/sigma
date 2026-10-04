import { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";

import { AppButton } from "@/components/ui/AppButton";
import { AppIconButton } from "@/components/ui/AppIconButton";
import { AppText } from "@/components/ui/AppText";
import { AppBadge } from "@/components/ui/AppBadge";
import { FormInput } from "@/components/form/FormInput";
import { QRScannerModal } from "@/components/scanner/QRScannerModal";
import { KeyboardScreen } from "@/components/layout/KeyboardScreen";
import { useAppTheme, spacing, radius } from "@/theme";
import {
  apiConfigService,
  type ServerConnectionTestResult,
} from "@/services/api-config.service";
import {
  serverConfigSchema,
  type ServerConfigFormValues,
} from "@/features/auth/schemas/server-config.schema";

export function ServerConfigScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useAppTheme();

  const [currentUrl, setCurrentUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [testResult, setTestResult] = useState<ServerConnectionTestResult | null>(
    null
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<ServerConfigFormValues>({
    resolver: zodResolver(serverConfigSchema),
    defaultValues: {
      protocol: "http",
      host: "",
      port: "",
    },
  });

  const watchedProtocol = watch("protocol");
  const watchedHost = watch("host") || "";
  const watchedPort = watch("port") || "";

  // Dynamic preview of the constructed URL
  const previewUrl = apiConfigService.buildUrlFromParts({
    protocol: watchedProtocol,
    host: watchedHost,
    port: watchedPort,
  });

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    const active = await apiConfigService.getActiveUrl();
    setCurrentUrl(active);

    const parts = apiConfigService.parseUrlToParts(active);
    setValue("protocol", parts.protocol);
    setValue("host", parts.host);
    setValue("port", parts.port);
  };

  const authenticateAdminAction = async (actionDescription: string): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: actionDescription,
        cancelLabel: "Cancelar",
        fallbackLabel: "Usar código del dispositivo",
      });

      return result.success;
    } catch {
      return true;
    }
  };

  const handleTestConnection = async (targetUrlToTest?: string, silent = false): Promise<boolean> => {
    const url = (targetUrlToTest || previewUrl).trim();
    if (!url || !watchedHost.trim()) {
      if (!silent) Alert.alert("Atención", "Ingresa la dirección IP o Host para probar la conexión.");
      return false;
    }

    setTestResult(null);
    setIsTesting(true);

    try {
      const result = await apiConfigService.testConnection(url);
      setTestResult(result);
      return result.success;
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || "No se pudo conectar con el servidor.",
      });
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfirmed = async (url: string) => {
    setIsSaving(true);
    try {
      const saved = await apiConfigService.setApiUrl(url);
      setCurrentUrl(saved);
      const parts = apiConfigService.parseUrlToParts(saved);
      setValue("protocol", parts.protocol);
      setValue("host", parts.host);
      setValue("port", parts.port);

      Alert.alert(
        "Configuración Guardada",
        "La dirección del servidor se ha actualizado correctamente.",
        [{ text: "Aceptar", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  };

  const onSave = async (values: ServerConfigFormValues) => {
    const constructedUrl = apiConfigService.buildUrlFromParts({
      protocol: values.protocol,
      host: values.host,
      port: values.port,
    });

    if (!constructedUrl) {
      Alert.alert("Error", "La dirección del servidor no es válida.");
      return;
    }

    const authenticated = await authenticateAdminAction(
      "Confirma tu identidad para cambiar la dirección del servidor"
    );

    if (!authenticated) {
      Alert.alert("Autenticación Requerida", "No se pudo verificar la identidad.");
      return;
    }

    setIsSaving(true);
    const reachable = await handleTestConnection(constructedUrl, true);
    setIsSaving(false);

    if (reachable) {
      await saveConfirmed(constructedUrl);
    } else {
      Alert.alert(
        "Servidor No Accesible",
        "No se pudo establecer conexión con este servidor en este momento. ¿Deseas guardar la configuración de todas formas?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Guardar de todos modos",
            style: "default",
            onPress: () => saveConfirmed(constructedUrl),
          },
        ]
      );
    }
  };

  const handleReset = async () => {
    const authenticated = await authenticateAdminAction(
      "Confirma tu identidad para restablecer el servidor predeterminado"
    );

    if (!authenticated) {
      return;
    }

    Alert.alert(
      "Restablecer Servidor",
      "¿Deseas volver a la dirección predeterminada del sistema?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restablecer",
          style: "destructive",
          onPress: async () => {
            const def = await apiConfigService.resetToDefault();
            setCurrentUrl(def);
            const parts = apiConfigService.parseUrlToParts(def);
            setValue("protocol", parts.protocol);
            setValue("host", parts.host);
            setValue("port", parts.port);
            setTestResult(null);
            Alert.alert("Listo", "Se ha restablecido el servidor predeterminado.");
          },
        },
      ]
    );
  };

  const handleScanQR = (data: string) => {
    setQrModalVisible(false);
    let extractedUrl = data.trim();

    try {
      const parsed = JSON.parse(extractedUrl);
      if (parsed.serverUrl) extractedUrl = parsed.serverUrl;
      else if (parsed.url) extractedUrl = parsed.url;
      else if (parsed.apiUrl) extractedUrl = parsed.apiUrl;
      else if (parsed.host) {
        if (parsed.protocol === "http" || parsed.protocol === "https") {
          setValue("protocol", parsed.protocol);
        }
        setValue("host", parsed.host);
        if (parsed.port) setValue("port", String(parsed.port));
        setTestResult(null);
        Alert.alert("Código QR detectado", `Servidor configurado: ${parsed.host}`);
        return;
      }
    } catch {
      // plain text string
    }

    const parts = apiConfigService.parseUrlToParts(extractedUrl);
    setValue("protocol", parts.protocol);
    setValue("host", parts.host);
    setValue("port", parts.port);
    setTestResult(null);
    Alert.alert("Código QR detectado", `Se configuró el servidor:\n${extractedUrl}`);
  };

  const isDefault = currentUrl === apiConfigService.getDefaultUrl();
  const isHttps = watchedProtocol === "https";

  return (
    <KeyboardScreen statusBarStyle={isDark ? "light" : "dark"}>
      <View style={styles.container}>
        {/* Header Compacto */}
        <View style={styles.header}>
          <AppIconButton
            icon="arrow-back"
            variant="tonal"
            size="md"
            onPress={() => router.back()}
            accessibilityLabel="Volver"
          />

          <View style={styles.headerInfo}>
            <AppText variant="title" weight="bold">
              Servidor de Red
            </AppText>
            <AppText variant="bodySm" color="textSecondary">
              Punto de enlace SIGMA API
            </AppText>
          </View>

          <AppIconButton
            icon={isDark ? "sunny-outline" : "moon-outline"}
            variant="tonal"
            size="md"
            onPress={toggleTheme}
            accessibilityLabel="Cambiar tema"
          />
        </View>

        {/* Tarjeta de Servidor Activo (Compacta) */}
        <View
          style={[
            styles.activeServerCard,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : "#F8FAFC",
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.activeServerHeader}>
            <View style={styles.activeServerTitleRow}>
              <Ionicons
                name="server"
                size={14}
                color={colors.primary}
              />
              <AppText variant="caption" weight="semibold" color="textSecondary">
                Servidor Activo
              </AppText>
            </View>
            <AppBadge
              label={isDefault ? "Por Defecto" : "Personalizado"}
              variant={isDefault ? "default" : "primary"}
              size="sm"
            />
          </View>
          <AppText
            variant="bodySm"
            weight="semibold"
            numberOfLines={1}
            truncate
            style={styles.activeServerUrl}
          >
            {currentUrl || "Cargando..."}
          </AppText>
        </View>

        {/* Formulario Compacto */}
        <View style={styles.formCard}>
          {/* 1. Selector de Protocolo Segmentado */}
          <View style={styles.inputGroup}>
            <AppText variant="bodySm" weight="semibold">
              Protocolo
            </AppText>
            <Controller
              control={control}
              name="protocol"
              render={({ field: { value, onChange } }) => (
                <View
                  style={[
                    styles.protocolSelectorContainer,
                    {
                      backgroundColor: isDark ? colors.surfaceSecondary : "#F1F5F9",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onChange("http")}
                    style={[
                      styles.protocolOption,
                      value === "http" && [
                        styles.protocolOptionActive,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isDark ? colors.primary : "#CBD5E1",
                        },
                      ],
                    ]}
                  >
                    <Ionicons
                      name="globe-outline"
                      size={15}
                      color={value === "http" ? colors.primary : colors.textMuted}
                    />
                    <AppText
                      variant="bodySm"
                      weight={value === "http" ? "bold" : "regular"}
                      color={value === "http" ? "text" : "textMuted"}
                    >
                      HTTP
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onChange("https")}
                    style={[
                      styles.protocolOption,
                      value === "https" && [
                        styles.protocolOptionActive,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.success,
                        },
                      ],
                    ]}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color={value === "https" ? colors.success : colors.textMuted}
                    />
                    <AppText
                      variant="bodySm"
                      weight={value === "https" ? "bold" : "regular"}
                      color={value === "https" ? "text" : "textMuted"}
                    >
                      HTTPS (SSL)
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          {/* 2. Dirección IP / Host y Puerto */}
          <View style={styles.fieldsRow}>
            <View style={styles.hostField}>
              <FormInput
                control={control}
                name="host"
                label="Dirección IP / Dominio"
                placeholder="157.173.99.216"
                autoCapitalize="none"
                autoCorrect={false}
                clearable
                leftIcon={
                  <Ionicons
                    name="server-outline"
                    size={17}
                    color={colors.textSecondary}
                  />
                }
              />
            </View>

            <View style={styles.portField}>
              <FormInput
                control={control}
                name="port"
                label="Puerto"
                placeholder="8085"
                keyboardType="numeric"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={5}
                clearable={false}
                leftIcon={
                  <Ionicons
                    name="hardware-chip-outline"
                    size={17}
                    color={colors.textSecondary}
                  />
                }
              />
            </View>
          </View>

          {/* 3. Endpoint Generado */}
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : "#F8FAFC",
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.previewHeader}>
              <Ionicons
                name="link-outline"
                size={14}
                color={colors.primary}
              />
              <AppText variant="caption" weight="semibold" color="textSecondary" style={{ flex: 1 }}>
                Endpoint Destino:
              </AppText>
              {isHttps ? (
                <View style={styles.badgeMini}>
                  <Ionicons name="shield-checkmark" size={11} color={colors.success} />
                  <AppText variant="caption" weight="medium" style={{ color: colors.success, fontSize: 11 }}>
                    SSL Seguro
                  </AppText>
                </View>
              ) : (
                <View style={styles.badgeMini}>
                  <Ionicons name="information-circle" size={11} color={colors.warning} />
                  <AppText variant="caption" weight="medium" style={{ color: colors.warning, fontSize: 11 }}>
                    Red Local
                  </AppText>
                </View>
              )}
            </View>
            <AppText
              variant="bodySm"
              weight="semibold"
              style={{ color: previewUrl ? colors.primary : colors.textMuted }}
              numberOfLines={1}
              truncate
            >
              {previewUrl || "Ingresa la IP o Host para generar URL"}
            </AppText>
          </View>

          {/* 4. Barra de Acciones Rápidas (QR + Probar Conexión) */}
          <View style={styles.quickActionsRow}>
            <View style={{ flex: 1 }}>
              <AppButton
                title="Escanear QR"
                variant="outline"
                size="sm"
                onPress={() => setQrModalVisible(true)}
                leftIcon={
                  <Ionicons
                    name="qr-code-outline"
                    size={15}
                    color={colors.primary}
                  />
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title={isTesting ? "Probando..." : "Probar Ping"}
                variant="outline"
                size="sm"
                loading={isTesting}
                disabled={isTesting || isSaving || !watchedHost.trim()}
                onPress={() => handleTestConnection()}
                leftIcon={
                  <Ionicons
                    name="pulse-outline"
                    size={15}
                    color={colors.primary}
                  />
                }
              />
            </View>
          </View>

          {/* Resultado de la prueba de conexión */}
          {testResult ? (
            <View
              style={[
                styles.testResultCard,
                {
                  backgroundColor: testResult.success
                    ? isDark
                      ? "#064E3B"
                      : "#DCFCE7"
                    : isDark
                      ? "#450A0A"
                      : "#FEE2E2",
                  borderColor: testResult.success
                    ? colors.success
                    : colors.danger,
                },
              ]}
            >
              <Ionicons
                name={testResult.success ? "checkmark-circle" : "alert-circle"}
                size={16}
                color={testResult.success ? colors.success : colors.danger}
              />
              <AppText
                variant="bodySm"
                weight="medium"
                style={{
                  flex: 1,
                  color: testResult.success
                    ? isDark
                      ? "#4ADE80"
                      : "#15803D"
                    : colors.danger,
                }}
              >
                {testResult.message}
              </AppText>
            </View>
          ) : null}

          {/* Botón Principal Guardar */}
          <View style={styles.mainActionsContainer}>
            <AppButton
              title={isSaving ? "Guardando..." : "Guardar Configuración"}
              variant="primary"
              size="md"
              loading={isSaving}
              disabled={isSaving || isTesting || !watchedHost.trim()}
              onPress={handleSubmit(onSave)}
              leftIcon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={17}
                  color={colors.white}
                />
              }
            />

            <AppButton
              title="Restablecer servidor por defecto"
              variant="ghost"
              size="sm"
              disabled={isSaving || isTesting || isDefault}
              onPress={handleReset}
            />
          </View>
        </View>

        {/* Nota de seguridad al pie */}
        <View style={styles.infoFooter}>
          <Ionicons
            name="shield-checkmark"
            size={13}
            color={colors.textMuted}
          />
          <AppText variant="caption" color="textMuted" align="center">
            Protegido con almacenamiento cifrado (SecureStore)
          </AppText>
        </View>
      </View>

      {/* Modal de Escáner QR */}
      <QRScannerModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        onScan={handleScanQR}
        title="Escanear Servidor QR"
        subtitle="Enfoca el código QR provisto por Soporte TI"
      />
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  activeServerCard: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 3,
  },
  activeServerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeServerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  activeServerUrl: {
    paddingLeft: 2,
  },
  formCard: {
    gap: spacing.sm,
  },
  inputGroup: {
    gap: 4,
  },
  protocolSelectorContainer: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  protocolOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  protocolOptionActive: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  hostField: {
    flex: 1,
  },
  portField: {
    width: 110,
  },
  previewBox: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 3,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  testResultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  mainActionsContainer: {
    gap: 4,
    marginTop: 2,
  },
  infoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: spacing.xs,
  },
});
