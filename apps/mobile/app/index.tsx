import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import {
  ConfirmModal,
  LoadingOverlay,
  Toast,
  type ToastVariant,
} from "@/components/feedback";
import {
  DateInput,
  FormError,
  FormInput,
  PasswordInput,
  SelectInput,
} from "@/components/form";
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

type FormDemoData = {
  fullName: string;
  email: string;
  password: string;
  department: string;
  startDate: string;
};

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorInput, setErrorInput] = useState("valor-invalido");
  const [loading, setLoading] = useState(false);
  const [cardPressCount, setCardPressCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);

  // Estados de Feedback Modals & Overlays
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Estado de Toast interactivo
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    message: string;
    variant: ToastVariant;
  } | null>(null);

  // Formulario con React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormDemoData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      department: "",
      startDate: "2026-10-15",
    },
  });

  const selectedDepartment = watch("department");
  const selectedDate = watch("startDate");

  const onSubmitForm = (data: FormDemoData) => {
    setToastMessage({
      title: "¡Formulario Válido!",
      message: `Usuario ${data.fullName} (${data.department || "Sin Dpto."}) registrado.`,
      variant: "success",
    });
  };

  const handleSimulateSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToastMessage({
        title: "¡Formulario guardado!",
        message: `Los datos fueron actualizados correctamente para ${email || "usuario"}.`,
        variant: "success",
      });
    }, 1200);
  };

  const handleConfirmAction = () => {
    setModalLoading(true);
    setTimeout(() => {
      setModalLoading(false);
      setShowConfirmModal(false);
      setShowDangerModal(false);
      setToastMessage({
        title: "Acción confirmada",
        message: "La operación se completó exitosamente.",
        variant: "success",
      });
    }, 1500);
  };

  const handleTriggerLoadingOverlay = () => {
    setShowLoadingOverlay(true);
    setTimeout(() => {
      setShowLoadingOverlay(false);
      setToastMessage({
        title: "Sincronización completada",
        message: "Los datos se sincronizaron con el servidor.",
        variant: "info",
      });
    }, 2000);
  };

  const handleSelectDepartment = () => {
    Alert.alert(
      "Seleccionar Departamento",
      "Elige un área de la empresa:",
      [
        { text: "Ingeniería", onPress: () => setValue("department", "Ingeniería") },
        { text: "Operaciones", onPress: () => setValue("department", "Operaciones") },
        { text: "Ventas", onPress: () => setValue("department", "Ventas") },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const handleSelectDate = () => {
    Alert.alert(
      "Fecha de Inicio",
      "Selecciona una fecha de inicio:",
      [
        { text: "Hoy (2026-10-04)", onPress: () => setValue("startDate", "2026-10-04") },
        { text: "Próximo Lunes (2026-10-06)", onPress: () => setValue("startDate", "2026-10-06") },
        { text: "Fin de Mes (2026-10-31)", onPress: () => setValue("startDate", "2026-10-31") },
        { text: "Cancelar", style: "cancel" },
      ]
    );
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
              onPress={() => {
                setNotificationCount((prev) => (prev > 0 ? prev - 1 : 5));
                setToastMessage({
                  title: "Notificación",
                  message: "Tienes nuevas alertas disponibles en tu bandeja.",
                  variant: "info",
                });
              }}
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
        {/* Toast flotante activo si existe */}
        {toastMessage ? (
          <Toast
            title={toastMessage.title}
            message={toastMessage.message}
            variant={toastMessage.variant}
            onDismiss={() => setToastMessage(null)}
          />
        ) : null}

        {/* ==================================================== */}
        {/* SECCIÓN A: FORMULARIOS (REACT HOOK FORM)             */}
        {/* ==================================================== */}
        <Section
          title="📝 Formularios (React Hook Form)"
          description="Integración de FormInput, PasswordInput, SelectInput y DateInput"
          withDivider
        >
          <AppCard variant="outlined">
            <FormInput
              control={control}
              name="fullName"
              label="Nombre Completo"
              placeholder="Juan Pérez"
              clearable
              rules={{ required: "El nombre es obligatorio" }}
            />

            <FormInput
              control={control}
              name="email"
              label="Correo Corporativo"
              placeholder="juan@empresa.com"
              keyboardType="email-address"
              autoCapitalize="none"
              clearable
              rules={{
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Formato de correo no válido",
                },
              }}
            />

            <PasswordInput
              control={control}
              name="password"
              label="Contraseña de Acceso"
              rules={{
                required: "La contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "Debe contener al menos 6 caracteres",
                },
              }}
            />

            <SelectInput
              label="Departamento"
              value={selectedDepartment}
              placeholder="Seleccionar área..."
              onPress={handleSelectDepartment}
              hint="Área a la que pertenece el usuario"
            />

            <DateInput
              label="Fecha de Ingreso"
              value={selectedDate}
              onPress={handleSelectDate}
            />

            <FormError message="Asegúrate de completar todos los campos obligatorios." />

            <AppButton
              title="Registrar Usuario (Submit)"
              variant="primary"
              loading={isSubmitting}
              onPress={handleSubmit(onSubmitForm)}
              style={styles.mtSm}
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN B: FEEDBACK & MODALES                       */}
        {/* ==================================================== */}
        <Section
          title="💬 Feedback & Modales"
          description="ConfirmModal, LoadingOverlay y Toast"
          withDivider
        >
          <AppText variant="subtitle">Modales y Overlays:</AppText>
          <View style={styles.buttonRow}>
            <AppButton
              title="Modal Confirmar"
              variant="primary"
              style={styles.flex1}
              onPress={() => setShowConfirmModal(true)}
            />
            <AppButton
              title="Modal Eliminar"
              variant="danger"
              style={styles.flex1}
              onPress={() => setShowDangerModal(true)}
            />
          </View>

          <AppButton
            title="Mostrar Loading Overlay (2s)"
            variant="outline"
            onPress={handleTriggerLoadingOverlay}
          />

          <AppText variant="subtitle" style={styles.mtMd}>
            Variantes de Toast (Notificaciones):
          </AppText>
          <View style={styles.toastGrid}>
            <Toast
              variant="success"
              title="Operación exitosa"
              message="El registro fue guardado correctamente en la base de datos."
            />
            <Toast
              variant="error"
              title="Error al procesar"
              message="No se pudo procesar el pago. Intente nuevamente."
            />
            <Toast
              variant="warning"
              title="Sesión por expirar"
              message="Tu sesión se cerrará automáticamente en 5 minutos."
            />
            <Toast
              variant="info"
              title="Actualización disponible"
              message="Hay una nueva versión de la app lista para descargar."
            />
          </View>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN C: LAYOUT & ESTRUCTURA                      */}
        {/* ==================================================== */}
        <Section
          title="📐 Layout & Estructura"
          description="AppHeader, Container y Section"
          withDivider
        >
          <AppText variant="subtitle">Variaciones de AppHeader:</AppText>
          <AppCard variant="outlined" padding="none">
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

            <AppHeader
              title="Mi Perfil"
              centerTitle
              rightAction={
                <AppBadge label="Pro" variant="primary" size="sm" />
              }
            />
          </AppCard>

          <AppText variant="subtitle" style={styles.mtMd}>
            Container con Ancho Máximo:
          </AppText>
          <Container
            maxWidth={320}
            centered
            padding="md"
            style={styles.centeredContainerBox}
          >
            <AppText variant="bodySm" color="primary" weight="medium" align="center">
              Container centrado (maxWidth: 320px)
            </AppText>
          </Container>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN D: COMPONENTES DE UI                        */}
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
          title="8. Carga Inline (Loading)"
          description="Indicadores de progreso dentro de componentes"
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

      {/* Modales de Confirmación */}
      <ConfirmModal
        visible={showConfirmModal}
        title="¿Publicar Solicitud?"
        message="Esta solicitud será visible para todo el equipo y no podrá ser revertida."
        confirmText="Sí, Publicar"
        loading={modalLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmModal
        visible={showDangerModal}
        variant="danger"
        title="¿Eliminar Registro?"
        message="Esta acción es irreversible y se perderán todos los datos asociados."
        confirmText="Sí, Eliminar"
        loading={modalLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setShowDangerModal(false)}
      />

      {/* Overlay de Carga de Pantalla Completa */}
      <LoadingOverlay
        visible={showLoadingOverlay}
        message="Sincronizando datos..."
        submessage="Por favor espera un momento"
      />
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
  toastGrid: {
    gap: spacing.sm,
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