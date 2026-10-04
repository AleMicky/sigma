import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  AppHeader,
  Container,
  Screen,
  Section,
} from "@/components/layout";
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
import { colors, spacing } from "@/theme";

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
    <Screen scrollable withPadding={false}>
      {/* 1. Header principal */}
      <AppHeader
        title="Design System"
        subtitle="Galería interactiva móvil"
        bordered
        rightAction={
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
        }
      />

      <Container style={styles.container}>
        {/* ==================================================== */}
        {/* SECCIÓN A: COMPONENTES DE LAYOUT                    */}
        {/* ==================================================== */}
        <Section
          title="📐 Componentes de Layout"
          description="Estructura, contenedores y cabeceras"
          withDivider
        >
          {/* Demo 1: Variantes de AppHeader */}
          <AppText variant="subtitle">A. Variaciones de AppHeader</AppText>
          <AppCard variant="outlined" padding="none">
            {/* Header con botón Atrás */}
            <AppHeader
              title="Detalle de Solicitud"
              subtitle="ID: #SOL-9842"
              showBack
              onBackPress={() => Alert.alert("Navegación", "Volver presionado")}
              bordered
              rightAction={
                <AppIconButton
                  icon="ellipsis-vertical"
                  accessibilityLabel="Opciones"
                  variant="ghost"
                  onPress={() => Alert.alert("Opciones", "Menú contextual")}
                />
              }
            />

            {/* Header Centrado estilo iOS */}
            <AppHeader
              title="Mi Perfil"
              centerTitle
              rightAction={
                <AppBadge label="Pro" variant="primary" size="sm" />
              }
            />
          </AppCard>

          {/* Demo 2: Variantes de Section */}
          <AppText variant="subtitle" style={styles.mtMd}>
            B. Variaciones de Section
          </AppText>
          <AppCard variant="outlined">
            <Section
              title="Sección con Acción Derecha"
              description="Ideal para listas con enlace a 'Ver todo'"
              rightAction={
                <AppText
                  variant="bodySm"
                  color="primary"
                  weight="semibold"
                  onPress={() => Alert.alert("Sección", "Acción derecha pulsada")}
                >
                  Ver todos (12)
                </AppText>
              }
            >
              <AppText variant="bodySm" color="textSecondary">
                Contenido interno organizado automáticamente con espaciado uniforme.
              </AppText>
            </Section>
          </AppCard>

          {/* Demo 3: Container con maxWidth */}
          <AppText variant="subtitle" style={styles.mtMd}>
            C. Container con Ancho Máximo (maxWidth)
          </AppText>
          <Container
            maxWidth={320}
            centered
            padding="md"
            style={styles.centeredContainerBox}
          >
            <AppText variant="bodySm" color="primary" weight="medium" align="center">
              Container centrado (maxWidth: 320px) para tablets o diálogos.
            </AppText>
          </Container>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN B: COMPONENTES UI                            */}
        {/* ==================================================== */}

        {/* 1. AppBadge */}
        <Section
          title="1. Insignias (AppBadge)"
          description="Etiquetas de estado en modo sutil y sólido"
          withDivider
        >
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
        </Section>

        {/* 2. AppIconButton */}
        <Section
          title="2. Botones de Icono (AppIconButton)"
          description="Variantes ghost, tonal, outline, filled y danger"
          withDivider
        >
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
        </Section>

        {/* 3. AppInput */}
        <Section
          title="3. Inputs (Campos de texto)"
          description="Foco animado, toggle de contraseña y validación"
          withDivider
        >
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
        </Section>

        {/* 4. AppButton */}
        <Section
          title="4. Botones y Variantes"
          description="Estados de carga y variantes semánticas"
          withDivider
        >
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
        </Section>

        {/* 5. AppCard */}
        <Section
          title="5. Tarjetas (AppCard)"
          description="Tarjetas elevadas interactivas y modulares"
          withDivider
        >
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
                Esta tarjeta tiene sombra, bordes y responde a toques con micro-animación.
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
        </Section>

        {/* 6. ErrorMessage */}
        <Section
          title="6. Mensajes de Error (ErrorMessage)"
          description="Banners de alerta y tarjetas de error de conexión"
          withDivider
        >
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
        </Section>

        {/* 7. EmptyState */}
        <Section
          title="7. Estado Vacío (EmptyState)"
          description="Pantallas o secciones sin información"
          withDivider
        >
          <AppCard variant="outlined">
            <EmptyState
              icon="document-text-outline"
              title="Sin solicitudes pendientes"
              description="Actualmente no tienes solicitudes registradas en la plataforma."
              actionLabel="Nueva Solicitud"
              onAction={() => Alert.alert("Acción", "Abriendo creador de solicitudes...")}
            />
          </AppCard>
        </Section>

        {/* 8. Loading */}
        <Section
          title="8. Carga (Loading)"
          description="Indicadores de progreso en bloque y pantalla completa"
        >
          <AppCard variant="outlined">
            <Loading
              fullScreen={false}
              size="small"
              message="Cargando información del módulo..."
            />
          </AppCard>
        </Section>
      </Container>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
  centeredContainerBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  mtMd: {
    marginTop: spacing.md,
  },
  mtSm: {
    marginTop: spacing.xs,
  },
});