import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  DataList,
  DetailCard,
  InfoRow,
  KeyValueRow,
  ListItem,
  StatCard,
  StatusRow,
  Timeline,
  type TimelineItem,
} from "@/components/data";


import {
  ConfirmModal,
  ErrorState,
  LoadingOverlay,
  SuccessMessage,
  Toast,
  WarningMessage,
  type ToastVariant,
} from "@/components/feedback";
import {
  DateInput,
  FormCheckbox,
  FormDate,
  FormError,
  FormInput,
  FormSection,
  FormSelect,
  FormSwitch,
  PasswordInput,
  SelectInput,
} from "@/components/form";
import {
  AppHeader,
  Container,
  Screen,
  Section,
} from "@/components/layout";
import { DrawerItem } from "@/components/navigation";

import {
  AppAvatar,
  AppBadge,
  AppBottomSheet,
  AppButton,
  AppCard,
  AppCheckbox,
  AppChip,
  AppIconButton,
  AppInput,
  AppLink,
  AppModal,
  AppPressable,
  AppRadio,
  AppRefreshControl,
  AppSpacer,
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
import { colors, radius, spacing } from "@/theme";

type FormDemoData = {
  fullName: string;
  email: string;
  password: string;
  department: string;
  startDate: string;
  receiveNotifications: boolean;
  agreeTerms: boolean;
};

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorInput, setErrorInput] = useState("valor-invalido");
  const [loading, setLoading] = useState(false);
  const [cardPressCount, setCardPressCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Nuevos Componentes UI & Navegación
  const [activeDrawer, setActiveDrawer] = useState("inicio");
  const [searchValue, setSearchValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(true);
  const [switchValue, setSwitchValue] = useState(true);
  const [selectedRadio, setSelectedRadio] = useState<string>("opt1");
  const [selectedChips, setSelectedChips] = useState<string[]>(["urgente", "qa"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [pressableCounter, setPressableCounter] = useState(0);

  // Estados de Modales y BottomSheet
  const [showAppModal, setShowAppModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados de Banners
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

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
    formState: { isSubmitting },
  } = useForm<FormDemoData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      department: "",
      startDate: "2026-10-15",
      receiveNotifications: true,
      agreeTerms: false,
    },
  });


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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setToastMessage({
        title: "¡Catálogo Actualizado!",
        message: "Todos los componentes del sistema se han refrescado con éxito.",
        variant: "success",
      });
    }, 1200);
  };

  return (
    <Screen
      scrollable
      withPadding={false}
      refreshControl={
        <AppRefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          title="Actualizando catálogo..."
        />
      }
    >
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
        {/* SECCIÓN A: MENSAJES DE ESTADO (FEEDBACK BANNERS)     */}
        {/* ==================================================== */}
        <Section
          title="📣 Mensajes de Estado"
          description="SuccessMessage, WarningMessage y ErrorState"
          withDivider
        >
          {showSuccessBanner ? (
            <SuccessMessage
              title="¡Operación completada!"
              message="Tu solicitud ha sido enviada con éxito al departamento de finanzas."
              actionLabel="Ver detalle"
              onAction={() => Alert.alert("Detalle", "Abriendo solicitud...")}
              onDismiss={() => setShowSuccessBanner(false)}
            />
          ) : null}

          {showWarningBanner ? (
            <WarningMessage
              title="Mantenimiento programado"
              message="La plataforma estará en mantenimiento hoy a las 23:00 hrs."
              actionLabel="Más info"
              onAction={() => Alert.alert("Mantenimiento", "Duración estimada: 30 minutos.")}
              onDismiss={() => setShowWarningBanner(false)}
            />
          ) : null}

          {/* ErrorState en bloque */}
          <AppCard variant="outlined">
            <ErrorState
              fullScreen={false}
              title="No se pudo cargar la vista"
              message="Hubo un problema de conexión con el servicio de autenticación."
              retryLabel="Reintentar ahora"
              onRetry={() => Alert.alert("Reintento", "Reintentando conexión...")}
              secondaryActionLabel="Volver"
              onSecondaryAction={() => Alert.alert("Volver", "Regresando a inicio")}
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN B: COMPONENTES DE DATOS (DATA)               */}
        {/* ==================================================== */}
        <Section
          title="📊 Visualización de Datos"
          description="StatCard, DetailCard, InfoRow, Timeline, ListItem y StatusRow"
          withDivider
        >
          {/* 1. StatCards Grid */}
          <AppText variant="subtitle">Tarjetas de Métricas (StatCard):</AppText>
          <View style={styles.statGrid}>
            <View style={styles.statRow}>
              <StatCard
                title="Total Solicitudes"
                value="142"
                variant="default"
                trend={{ value: "+12.4%", isPositive: true }}
                icon={<Ionicons name="document-text-outline" size={18} color={colors.primary} />}
                onPress={() => Alert.alert("Métricas", "Filtrando todas las solicitudes")}
                style={styles.flex1}
              />
              <StatCard
                title="Aprobadas"
                value="98"
                variant="success"
                trend={{ value: "+8.2%", isPositive: true }}
                icon={<Ionicons name="checkmark-circle-outline" size={18} color="#166534" />}
                onPress={() => Alert.alert("Métricas", "Filtrando solicitudes aprobadas")}
                style={styles.flex1}
              />
            </View>

            <View style={styles.statRow}>
              <StatCard
                title="En Revisión"
                value="36"
                variant="warning"
                description="8 requieren atención"
                style={styles.flex1}
              />
              <StatCard
                title="Rechazadas"
                value="8"
                variant="danger"
                trend={{ value: "-2.1%", isPositive: false }}
                icon={<Ionicons name="close-circle-outline" size={18} color={colors.danger} />}
                style={styles.flex1}
              />
            </View>
          </View>

          {/* 2. DetailCard & InfoRow */}
          <AppText variant="subtitle" style={styles.mtMd}>
            Tarjeta de Detalle (DetailCard) & Filas de Info (InfoRow):
          </AppText>
          <DetailCard
            title="Expediente de Proyecto"
            subtitle="Migración Cloud AWS 2026"
            icon={<Ionicons name="briefcase-outline" size={20} color={colors.primary} />}
            headerRight={<AppBadge label="En Curso" variant="primary" size="sm" />}
            withHeaderDivider
            footer={
              <AppLink
                variant="primary"
                onPress={() => Alert.alert("Descarga", "Descargando resumen ejecutivo")}
              >
                Descargar Resumen Ejecutivo (PDF) →
              </AppLink>
            }
          >
            <InfoRow
              label="Líder Técnico"
              value="Carlos Mendoza"
              subtitle="Senior Cloud Architect"
              icon={<Ionicons name="person-outline" size={18} color={colors.primary} />}
              withDivider
            />
            <InfoRow
              label="Presupuesto Asignado"
              value="$12,850.00 USD"
              valueColor="primary"
              icon={<Ionicons name="cash-outline" size={18} color={colors.primary} />}
              withDivider
            />
            <InfoRow
              label="Estado de Auditoría"
              value="Certificado SOC2 Tipo II"
              valueColor="success"
              icon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />}
            />
          </DetailCard>

          {/* 3. Timeline */}
          <AppText variant="subtitle" style={styles.mtMd}>
            Línea de Tiempo (Timeline):
          </AppText>
          <DetailCard
            title="Historial de Auditoría"
            subtitle="Progreso cronológico del expediente"
          >
            <Timeline
              items={[
                {
                  id: "1",
                  title: "Solicitud Registrada",
                  description: "Carlos Mendoza creó la solicitud de presupuesto #SOL-8910",
                  date: "04 Oct, 09:30 AM",
                  variant: "success",
                },
                {
                  id: "2",
                  title: "Aprobación Técnica",
                  description: "Revisado y validado por el equipo de infraestructura",
                  date: "04 Oct, 11:15 AM",
                  variant: "success",
                },
                {
                  id: "3",
                  title: "En Revisión Financiera",
                  description: "Pendiente de validación por finanzas",
                  date: "04 Oct, 01:00 PM",
                  variant: "primary",
                  active: true,
                },
                {
                  id: "4",
                  title: "Desembolso Final",
                  description: "Transferencia a la cuenta de compras",
                  variant: "neutral",
                },
              ]}
            />
          </DetailCard>

          {/* 4. List Items */}
          <AppText variant="subtitle" style={styles.mtMd}>
            Elementos de Lista (ListItem):
          </AppText>
          <View style={styles.gapSm}>
            <ListItem
              title="Carlos Mendoza"
              subtitle="Ingeniero de Software Senior"
              caption="Última actividad: hace 10 min"
              left={<AppAvatar name="Carlos Mendoza" size="md" online />}
              onPress={() => Alert.alert("Detalle", "Abriendo perfil de Carlos")}
            />
            <ListItem
              title="Solicitud #SOL-8910"
              subtitle="Aprobación de presupuesto para servidores"
              variant="card"
              right={<AppBadge label="Pendiente" variant="warning" size="sm" />}
              onPress={() => Alert.alert("Detalle", "Abriendo solicitud")}
            />
          </View>

          {/* 5. KeyValueRow & StatusRow */}
          <AppText variant="subtitle" style={styles.mtMd}>
            Filas de Metadatos (KeyValueRow & StatusRow):
          </AppText>
          <AppCard variant="outlined">
            <StatusRow
              label="Estado de cuenta"
              status="Verificado"
              variant="success"
              subtitle="Cuenta corporativa activa"
              withDivider
            />
            <KeyValueRow
              label="ID de Usuario"
              value="USR-94820"
              withDivider
            />
            <KeyValueRow
              label="Plan Actual"
              value="Enterprise Pro"
              valueColor="primary"
              withDivider
            />
            <KeyValueRow
              label="Saldo Disponible"
              value="$1,450.00 USD"
              valueColor="success"
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN C: AVATARES, CHIPS & BUSCADOR                */}
        {/* ==================================================== */}
        <Section
          title="🌟 Avatares y Búsqueda"
          description="AppAvatar, SearchInput y AppChip"
          withDivider
        >
          <SearchInput
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Buscar colaboradores, solicitudes..."
          />

          <AppText variant="subtitle" style={styles.mtSm}>
            Avatares (AppAvatar):
          </AppText>
          <View style={styles.avatarRow}>
            <AppAvatar name="Carlos Mendoza" size="lg" online />
            <AppAvatar name="Ana Silva" size="md" online={false} />
            <AppAvatar name="Juan Pérez" size="sm" />
            <AppAvatar name="Admin" size="xs" />
          </View>

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
        {/* SECCIÓN D: CONTROLES DE SELECCIÓN                    */}
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
        {/* SECCIÓN E: PAGINACIÓN Y SKELETON                     */}
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
        {/* SECCIÓN F: FORMULARIOS (REACT HOOK FORM)             */}
        {/* ==================================================== */}
        <Section
          title="📝 Formularios (React Hook Form)"
          description="FormSection, FormInput, PasswordInput, FormSelect, FormDate, FormSwitch y FormCheckbox"
          withDivider
        >
          <AppCard variant="outlined" style={styles.gapMd}>
            <FormSection
              title="1. Datos de Cuenta"
              description="Información básica y credenciales de acceso"
              withDivider
            >
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
            </FormSection>

            <FormSection
              title="2. Información Laboral"
              description="Asignación de área y fecha de ingreso"
              withDivider
            >
              <FormSelect
                control={control}
                name="department"
                label="Departamento"
                placeholder="Seleccionar área..."
                onPress={handleSelectDepartment}
                hint="Área a la que pertenece el colaborador"
                rules={{ required: "Debes seleccionar un departamento" }}
              />

              <FormDate
                control={control}
                name="startDate"
                label="Fecha de Ingreso"
                onPress={handleSelectDate}
                rules={{ required: "La fecha de ingreso es requerida" }}
              />
            </FormSection>

            <FormSection
              title="3. Preferencias y Consentimiento"
              description="Configuración de notificaciones y términos"
            >
              <FormSwitch
                control={control}
                name="receiveNotifications"
                label="Notificaciones Push"
                description="Recibir alertas de solicitudes y estados en tiempo real"
              />

              <FormCheckbox
                control={control}
                name="agreeTerms"
                label="Acepto los Términos y Condiciones"
                description="He leído las políticas de seguridad y privacidad"
                rules={{
                  validate: (val) =>
                    Boolean(val) || "Debes aceptar los términos para continuar",
                }}
              />
            </FormSection>

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
        {/* SECCIÓN G: FEEDBACK & MODALES                       */}
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

          <View style={styles.buttonRow}>
            <AppButton
              title="Abrir AppModal"
              variant="outline"
              style={styles.flex1}
              onPress={() => setShowAppModal(true)}
            />
            <AppButton
              title="Abrir BottomSheet"
              variant="outline"
              style={styles.flex1}
              onPress={() => setShowBottomSheet(true)}
            />
          </View>

          <AppButton
            title="Mostrar Loading Overlay (2s)"
            variant="outline"
            onPress={handleTriggerLoadingOverlay}
          />
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN H: ELEMENTOS DE NAVEGACIÓN (DRAWER & TABS)   */}
        {/* ==================================================== */}
        <Section
          title="🧭 Elementos de Navegación"
          description="DrawerItem con estados interactivos, badges y subtítulos"
          withDivider
        >
          <AppCard variant="outlined">
            <AppText variant="caption" style={styles.mbSm}>
              Menú Lateral Interactivo (Toca un ítem para activarlo):
            </AppText>

            <DrawerItem
              icon="home-outline"
              label="Panel Principal"
              active={activeDrawer === "inicio"}
              onPress={() => setActiveDrawer("inicio")}
            />

            <DrawerItem
              icon="document-text-outline"
              label="Mis Solicitudes"
              subtitle="8 pendientes de revisión"
              badge={8}
              badgeVariant="warning"
              showChevron
              active={activeDrawer === "solicitudes"}
              onPress={() => setActiveDrawer("solicitudes")}
            />

            <DrawerItem
              icon="chatbubbles-outline"
              label="Mensajería Directa"
              subtitle="Canales de soporte"
              badge="Nuevo"
              badgeVariant="primary"
              badgeAppearance="solid"
              showChevron
              active={activeDrawer === "mensajes"}
              onPress={() => setActiveDrawer("mensajes")}
            />

            <DrawerItem
              icon="notifications-outline"
              label="Alertas Críticas"
              badge="3"
              badgeVariant="danger"
              badgeAppearance="solid"
              active={activeDrawer === "alertas"}
              onPress={() => setActiveDrawer("alertas")}
            />

            <DrawerItem
              icon="shield-checkmark-outline"
              label="Seguridad y Accesos"
              subtitle="Autenticación 2FA activa"
              active={activeDrawer === "seguridad"}
              onPress={() => setActiveDrawer("seguridad")}
            />

            <DrawerItem
              icon="lock-closed-outline"
              label="Panel de Administración"
              subtitle="Requiere rol de SuperAdmin"
              disabled
              onPress={() => {}}
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN I: ENLACES & ELEMENTOS TÁCTILES (LINK/PRESS) */}
        {/* ==================================================== */}
        <Section
          title="🔗 Enlaces & Feedback Táctil"
          description="AppLink, AppPressable y AppSpacer"
        >
          <AppCard variant="outlined">
            <AppText variant="subtitle">Enlaces Tipográficos (AppLink):</AppText>
            <View style={styles.linkRow}>
              <AppLink onPress={() => Alert.alert("Link", "Abriendo enlace principal")}>
                Enlace Primario
              </AppLink>
              <AppLink
                variant="secondary"
                underline
                onPress={() => Alert.alert("Términos", "Ver términos y condiciones")}
              >
                Términos y Condiciones
              </AppLink>
              <AppLink
                variant="danger"
                onPress={() => Alert.alert("Eliminar", "Cancelar suscripción")}
              >
                Cancelar Suscripción
              </AppLink>
              <AppLink
                variant="muted"
                disabled
              >
                Enlace Deshabilitado
              </AppLink>
            </View>

            <Divider spacingVertical="md" />

            <AppText variant="subtitle">Contenedores Táctiles (AppPressable):</AppText>
            <AppText variant="caption" style={styles.mbSm}>
              Contador interactivo de pulsaciones: {pressableCounter}
            </AppText>

            <View style={styles.buttonRow}>
              <AppPressable
                feedback="scale"
                onPress={() => setPressableCounter((c) => c + 1)}
                style={styles.pressableBox}
              >
                <AppText variant="bodySm" style={styles.textCenter}>
                  Efecto Scale (Presióname)
                </AppText>
              </AppPressable>

              <AppPressable
                feedback="highlight"
                onPress={() => setPressableCounter((c) => c + 1)}
                style={styles.pressableBox}
              >
                <AppText variant="bodySm" style={styles.textCenter}>
                  Efecto Highlight
                </AppText>
              </AppPressable>
            </View>
          </AppCard>
        </Section>
      </Container>

      {/* Modal General (AppModal) */}
      <AppModal
        visible={showAppModal}
        title="Detalle de la Solicitud"
        subtitle="Expediente #SOL-2026-8910"
        onClose={() => setShowAppModal(false)}
        footer={
          <View style={styles.buttonRow}>
            <AppButton
              title="Cerrar"
              variant="outline"
              style={styles.flex1}
              onPress={() => setShowAppModal(false)}
            />
            <AppButton
              title="Aprobar Solicitud"
              variant="primary"
              style={styles.flex1}
              onPress={() => {
                setShowAppModal(false);
                setToastMessage({
                  title: "¡Aprobada!",
                  message: "La solicitud ha sido aprobada correctamente.",
                  variant: "success",
                });
              }}
            />
          </View>
        }
      >
        <AppText variant="bodySm">
          Esta solicitud incluye el requerimiento de presupuesto adicional para la ampliación del clúster de servidores de base de datos en AWS.
        </AppText>
        <AppSpacer size="sm" />
        <StatusRow label="Prioridad" status="Alta" variant="danger" withDivider />
        <KeyValueRow label="Monto Solicitado" value="$3,500.00 USD" valueColor="primary" withDivider />
        <KeyValueRow label="Solicitante" value="Carlos Mendoza (Lead DevOps)" />
      </AppModal>

      {/* Hoja Inferior (AppBottomSheet) */}
      <AppBottomSheet
        visible={showBottomSheet}
        title="Opciones de Acción"
        subtitle="Selecciona una acción rápida para este registro"
        onClose={() => setShowBottomSheet(false)}
        showCloseButton
      >
        <DrawerItem
          icon="share-social-outline"
          label="Compartir Expediente"
          subtitle="Enviar enlace seguro por correo"
          onPress={() => {
            setShowBottomSheet(false);
            Alert.alert("Compartir", "Enlace copiado al portapapeles");
          }}
        />
        <DrawerItem
          icon="download-outline"
          label="Descargar Informe PDF"
          subtitle="Documento firmado digitalmente"
          onPress={() => {
            setShowBottomSheet(false);
            Alert.alert("Descarga", "Descargando archivo...");
          }}
        />
        <DrawerItem
          icon="trash-outline"
          label="Mover a Papelera"
          badge="Irreversible"
          badgeVariant="danger"
          onPress={() => {
            setShowBottomSheet(false);
            setShowDangerModal(true);
          }}
        />
      </AppBottomSheet>

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
  gapSm: {
    gap: spacing.sm,
  },
  gapMd: {
    gap: spacing.md,
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
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  pressableBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  textCenter: {
    textAlign: "center",
  },
  toastGrid: {
    gap: spacing.sm,
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
  mbSm: {
    marginBottom: spacing.xs,
  },
  statGrid: {
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});