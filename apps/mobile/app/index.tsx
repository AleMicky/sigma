import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import {
  AppBadge,
  AppButton,
  AppCard,
  AppIconButton,
  AppInput,
  AppText,
  Divider,
  EmptyState,
  ErrorMessage,
  Loading,
} from "@/components/ui";
import { spacing } from "@/theme";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorInput, setErrorInput] = useState("valor-invalido");
  const [loading, setLoading] = useState(false);
  const [cardPressCount, setCardPressCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);

  const handleSimulateSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Éxito", `Formulario enviado con el correo: ${email || "vacío"}`);
    }, 1500);
  };

  return (
    <Screen scrollable contentContainerStyle={styles.container}>
      {/* Header con IconButtons */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText variant="h1" color="primary">
            Design System
          </AppText>
          <AppText variant="bodySm" color="textSecondary">
            Galería interactiva de componentes UI
          </AppText>
        </View>

        <View style={styles.headerActions}>
          <AppIconButton
            icon="notifications-outline"
            accessibilityLabel="Notificaciones"
            variant="tonal"
            badgeCount={notificationCount}
            onPress={() => setNotificationCount((prev) => (prev > 0 ? prev - 1 : 5))}
          />
          <AppIconButton
            icon="settings-outline"
            accessibilityLabel="Configuración"
            variant="ghost"
            onPress={() => Alert.alert("Configuración", "Acceso a ajustes")}
          />
        </View>
      </View>

      <Divider />

      {/* Sección 1: Badges / Insignias */}
      <View style={styles.section}>
        <AppText variant="subtitle">1. Insignias (AppBadge)</AppText>

        <AppText variant="caption">Estilo Sutil (Subtle):</AppText>
        <View style={styles.badgeRow}>
          <AppBadge label="Default" variant="default" />
          <AppBadge label="Primary" variant="primary" dot />
          <AppBadge label="Success" variant="success" dot />
          <AppBadge label="Warning" variant="warning" dot />
          <AppBadge label="Danger" variant="danger" dot />
        </View>

        <AppText variant="caption">Estilo Sólido (Solid):</AppText>
        <View style={styles.badgeRow}>
          <AppBadge label="Primary" variant="primary" appearance="solid" />
          <AppBadge label="Success" variant="success" appearance="solid" />
          <AppBadge label="Danger" variant="danger" appearance="solid" />
          <AppBadge label="Small" variant="primary" size="sm" />
        </View>
      </View>

      <Divider />

      {/* Sección 2: Icon Buttons */}
      <View style={styles.section}>
        <AppText variant="subtitle">2. Botones de Icono (AppIconButton)</AppText>
        <View style={styles.iconButtonRow}>
          <AppIconButton
            icon="heart-outline"
            accessibilityLabel="Favorito"
            variant="ghost"
            onPress={() => Alert.alert("Favorito", "Agregado")}
          />
          <AppIconButton
            icon="bookmark-outline"
            accessibilityLabel="Guardar"
            variant="tonal"
            onPress={() => Alert.alert("Guardar", "Guardado")}
          />
          <AppIconButton
            icon="share-social-outline"
            accessibilityLabel="Compartir"
            variant="outline"
            onPress={() => Alert.alert("Compartir", "Enlace copiado")}
          />
          <AppIconButton
            icon="add"
            accessibilityLabel="Crear"
            variant="filled"
            onPress={() => Alert.alert("Crear", "Nuevo elemento")}
          />
          <AppIconButton
            icon="trash-outline"
            accessibilityLabel="Eliminar"
            variant="danger"
            onPress={() => Alert.alert("Eliminar", "¿Estás seguro?")}
          />
        </View>
      </View>

      <Divider />

      {/* Sección 3: Inputs */}
      <View style={styles.section}>
        <AppText variant="subtitle">3. Inputs (Campos de texto)</AppText>

        <AppInput
          label="Correo Electrónico"
          placeholder="ejemplo@empresa.com"
          value={email}
          onChangeText={setEmail}
          clearable
          onClear={() => setEmail("")}
          hint="Usamos tu correo para la autenticación"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AppInput
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <AppInput
          label="Campo con Validación"
          value={errorInput}
          onChangeText={setErrorInput}
          error={errorInput.length < 5 ? "Debe tener al menos 5 caracteres" : undefined}
        />

        <AppInput
          label="Campo Deshabilitado"
          value="Contenido no editable"
          editable={false}
        />
      </View>

      <Divider label="O continúa con" />

      {/* Sección 4: Botones */}
      <View style={styles.section}>
        <AppText variant="subtitle">4. Botones y Variantes</AppText>

        <AppButton
          title={loading ? "Procesando..." : "Botón Principal (Primary)"}
          variant="primary"
          loading={loading}
          onPress={handleSimulateSubmit}
        />

        <View style={styles.buttonRow}>
          <AppButton
            title="Secondary"
            variant="secondary"
            style={styles.flex1}
            onPress={() => Alert.alert("Botón", "Secundario presionado")}
          />
          <AppButton
            title="Outline"
            variant="outline"
            style={styles.flex1}
            onPress={() => Alert.alert("Botón", "Outline presionado")}
          />
        </View>

        <View style={styles.buttonRow}>
          <AppButton
            title="Danger"
            variant="danger"
            style={styles.flex1}
            onPress={() => Alert.alert("Atención", "Acción destructiva")}
          />
          <AppButton
            title="Ghost"
            variant="ghost"
            style={styles.flex1}
            onPress={() => Alert.alert("Botón", "Ghost presionado")}
          />
        </View>
      </View>

      <Divider />

      {/* Sección 5: Cards */}
      <View style={styles.section}>
        <AppText variant="subtitle">5. Tarjetas (AppCard)</AppText>

        <AppCard
          variant="elevated"
          onPress={() => setCardPressCount((prev) => prev + 1)}
        >
          <AppCard.Header>
            <View style={styles.cardHeaderRow}>
              <AppText variant="subtitle" color="primary">
                Tarjeta Elevada
              </AppText>
              <AppBadge label="Interactiva" variant="primary" size="sm" />
            </View>
          </AppCard.Header>
          <AppCard.Body>
            <AppText variant="body">
              Esta tarjeta tiene sombra, bordes y responde a toques.
            </AppText>
            <AppText variant="bodySm" color="textSecondary" style={styles.mtSm}>
              Toques registrados: {cardPressCount}
            </AppText>
          </AppCard.Body>
          <AppCard.Footer>
            <AppText variant="caption" color="primary" weight="semibold">
              Toca para interactuar 👆
            </AppText>
          </AppCard.Footer>
        </AppCard>

        <AppCard variant="filled">
          <AppText variant="subtitle">Tarjeta con Fondo (Filled)</AppText>
          <AppText variant="bodySm" color="textSecondary" style={styles.mtSm}>
            Ideal para contenedores secundarios o paneles informativos.
          </AppText>
        </AppCard>
      </View>

      <Divider />

      {/* Sección 6: Mensajes de Error */}
      <View style={styles.section}>
        <AppText variant="subtitle">6. Mensajes de Error (ErrorMessage)</AppText>

        <ErrorMessage
          variant="banner"
          title="Error de Validación"
          message="Revisa los datos ingresados en el formulario."
          onRetry={() => Alert.alert("Reintento", "Reintentando operación...")}
        />

        <ErrorMessage
          variant="card"
          title="No se pudo conectar al servidor"
          message="Verifica tu conexión a internet o intenta nuevamente en unos minutos."
          onRetry={() => Alert.alert("Reintento", "Reconectando...")}
        />
      </View>

      <Divider />

      {/* Sección 7: Empty State */}
      <View style={styles.section}>
        <AppText variant="subtitle">7. Estado Vacío (EmptyState)</AppText>
        <AppCard variant="outlined">
          <EmptyState
            icon="document-text-outline"
            title="Sin solicitudes pendientes"
            description="Actualmente no tienes solicitudes registradas en la plataforma."
            actionLabel="Nueva Solicitud"
            onAction={() => Alert.alert("Acción", "Abriendo creador de solicitudes...")}
          />
        </AppCard>
      </View>

      <Divider />

      {/* Sección 8: Loading Inline */}
      <View style={styles.section}>
        <AppText variant="subtitle">8. Loading (Inline)</AppText>
        <AppCard variant="outlined">
          <Loading
            fullScreen={false}
            size="small"
            message="Cargando información del módulo..."
          />
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  section: {
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center",
  },
  iconButtonRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  mtSm: {
    marginTop: spacing.xs,
  },
});