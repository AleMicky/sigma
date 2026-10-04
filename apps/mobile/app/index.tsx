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
  AppAvatar,
  AppBadge,
  AppButton,
  AppCard,
  AppCheckbox,
  AppChip,
  AppIconButton,
  AppInput,
  AppRadio,
  AppSwitch,
  AppText,
  Divider,
  EmptyState,
  ErrorMessage,
  Loading,
  Pagination,
  SearchInput,
  Skeleton,
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

  // Estados de Nuevos Componentes UI
  const [searchValue, setSearchValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [switchValue, setSwitchValue] = useState(true);
  const [selectedRadio, setSelectedRadio] = useState<string>("opt1");
  const [selectedChips, setSelectedChips] = useState<string[]>(["urgente", "qa"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSkeleton, setShowSkeleton] = useState(false);

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

  const toggleChip = (id: string) => {
    setSelectedChips((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
        {/* NUEVOS COMPONENTES: AVATARS, CHIPS, SWITCH & CONTROLS */}
        {/* ==================================================== */}
        <Section
          title="🌟 Avatares y Búsqueda"
          description="AppAvatar, SearchInput y AppChip"
          withDivider
        >
          {/* Búsqueda */}
          <SearchInput
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Buscar colaboradores, solicitudes..."
          />

          {/* Avatares */}
          <AppText variant="subtitle" style={styles.mtSm}>
            Avatares (AppAvatar):
          </AppText>
          <View style={styles.avatarRow}>
            <AppAvatar name="Carlos Mendoza" size="lg" online />
            <AppAvatar name="Ana Silva" size="md" online={false} />
            <AppAvatar name="Juan Pérez" size="sm" />
            <AppAvatar name="Admin" size="xs" />
          </View>

          {/* Chips */}
          <AppText variant="subtitle" style={styles.mtSm}>
            Filtros & Tags (AppChip):
          </AppText>
          <View style={styles.chipRow}>
            <AppChip
              label="Todos"
              selected={selectedChips.includes("todos")}
              onPress={() => toggleChip("todos")}
            />
            <AppChip
              label="Urgente"
              selected={selectedChips.includes("urgente")}
              onPress={() => toggleChip("urgente")}
              onRemove={() => toggleChip("urgente")}
            />
            <AppChip
              label="QA Testing"
              selected={selectedChips.includes("qa")}
              onPress={() => toggleChip("qa")}
              onRemove={() => toggleChip("qa")}
            />
            <AppChip
              label="Producción"
              selected={selectedChips.includes("prod")}
              onPress={() => toggleChip("prod")}
            />
          </View>
        </Section>

        {/* ==================================================== */}
        {/* CONTROLES DE SELECCIÓN: CHECKBOX, RADIO, SWITCH      */}
        {/* ==================================================== */}
        <Section
          title="🔘 Controles de Selección"
          description="AppCheckbox, AppRadio y AppSwitch"
          withDivider
        >
          <AppCard variant="outlined">
            <AppSwitch
              label="Notificaciones Push"
              description="Recibe alertas en tiempo real sobre tus solicitudes"
              value={switchValue}
              onValueChange={setSwitchValue}
            />

            <Divider spacingVertical="sm" />

            <AppCheckbox
              label="Acepto los Términos y Condiciones"
              description="He leído las políticas de uso y privacidad"
              checked={checkboxValue}
              onChange={setCheckboxValue}
            />

            <Divider spacingVertical="sm" />

            <AppText variant="caption">Selecciona tu prioridad:</AppText>
            <AppRadio
              label="Prioridad Alta"
              description="Atención inmediata requerida"
              selected={selectedRadio === "opt1"}
              onPress={() => setSelectedRadio("opt1")}
            />
            <AppRadio
              label="Prioridad Normal"
              description="Procesamiento estándar"
              selected={selectedRadio === "opt2"}
              onPress={() => setSelectedRadio("opt2")}
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* PAGINACIÓN Y SKELETON                                */}
        {/* ==================================================== */}
        <Section
          title="💀 Skeleton & Paginación"
          description="Efectos de carga con pulso y navegación de páginas"
          rightAction={
            <AppButton
              title={showSkeleton ? "Ver Contenido" : "Ver Skeleton"}
              size="sm"
              variant="outline"
              onPress={() => setShowSkeleton((prev) => !prev)}
            />
          }
          withDivider
        >
          {showSkeleton ? (
            <AppCard variant="outlined" style={styles.gapMd}>
              <View style={styles.skeletonHeader}>
                <Skeleton variant="circular" height={44} width={44} />
                <View style={styles.flex1GapXs}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} />
                </View>
              </View>
              <Skeleton variant="rectangular" height={100} />
            </AppCard>
          ) : (
            <AppCard variant="outlined">
              <AppText variant="subtitle">Resultados de Solicitudes</AppText>
              <AppText variant="bodySm" color="textSecondary" style={styles.mtSm}>
                Mostrando elementos de la página {currentPage}.
              </AppText>
              <Divider spacingVertical="md" />
              <Pagination
                page={currentPage}
                totalPages={8}
                onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(8, p + 1))}
              />
            </AppCard>
          )}
        </Section>

        {/* ==================================================== */}
        {/* FORMULARIOS (REACT HOOK FORM)                        */}
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
        {/* FEEDBACK & MODALES                                  */}
        {/* ==================================================== */}
        <Section
          title="💬 Feedback & Modales"
          description="ConfirmModal, LoadingOverlay y Toast"
          withDivider
        >
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
        </Section>

        {/* ==================================================== */}
        {/* COMPONENTES BASE: BOTONES & BADGES                   */}
        {/* ==================================================== */}
        <Section
          title="1. Insignias (AppBadge)"
          description="Etiquetas de estado en modo sutil y sólido"
          withDivider
        >
          <View style={styles.badgeRow}>
            <AppBadge label="Default" variant="default" />
            <AppBadge label="Primary" variant="primary" dot />
            <AppBadge label="Success" variant="success" dot />
            <AppBadge label="Warning" variant="warning" dot />
            <AppBadge label="Danger" variant="danger" dot />
          </View>
        </Section>

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
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
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
  gapMd: {
    gap: spacing.md,
  },
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  flex1GapXs: {
    flex: 1,
    gap: spacing.xs,
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