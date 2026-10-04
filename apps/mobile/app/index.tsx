import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ActionMenu,
  FloatingActionButton,
  SwipeAction,
} from "@/components/actions";
import {
  AnimatedCard,
  FadeInView,
  PulseView,
  ScalePressable,
  SlideInView,
  type AnimatedCardEntrance,
  type AnimatedCardVariant,
  type FadeDirection,
  type PulseType,
  type SlideDirection,
} from "@/components/animation";
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
  DateRangePicker,
  TimeInput,
  type DateRange,
} from "@/components/date";

import {
  AppFilePicker,
  AppImagePicker,
  UploadProgress,
  type SelectedFile,
  type SelectedImage,
  type UploadStatus,
} from "@/components/upload";

import {
  FilterBar,
  FilterChip,
  FilterSection,
  FilterSheet,
  type FilterOption,
} from "@/components/filters";

import {
  AttachmentItem,
  AvatarPicker,
  ImagePreview,
} from "@/components/media";

import { LocationPermission } from "@/components/location";

import {
  NotFoundState,
  PermissionState,
  UnauthorizedState,
} from "@/components/states";

import {
  ConfirmModal,
  ErrorState,
  InfoMessage,
  LoadingOverlay,
  OfflineBanner,
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
import { colors, radius, spacing, useAppTheme } from "@/theme";

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
  const { isDark, themeMode, setThemeMode, toggleTheme } = useAppTheme();
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

  // Estados de Modales, BottomSheet y ActionMenu
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [fabExtended, setFabExtended] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);


  // Estados de Banners
  const [showSuccessBanner, setShowSuccessBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [isOffline, setIsOffline] = useState(false);


  // Estado de Toast interactivo
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    message: string;
    variant: ToastVariant;
  } | null>(null);

  // Estados de Selectores de Fecha y Hora
  const [selectedTime, setSelectedTime] = useState<Date | null>(new Date());
  const [selectedTime12h, setSelectedTime12h] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Estados de Carga de Archivos y Multimedia (Upload)
  const [demoFile, setDemoFile] = useState<SelectedFile | null>({
    uri: "file:///mock/documento_soporte.pdf",
    name: "balance_general_q3.pdf",
    size: 2457600,
    mimeType: "application/pdf",
  });
  const [demoImage, setDemoImage] = useState<SelectedImage | null>(null);
  const [demoAvatar, setDemoAvatar] = useState<SelectedImage | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(68);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("uploading");

  // Estados de Filtros (Filters)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["presupuesto", "compras"]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [sheetDepartment, setSheetDepartment] = useState<string>("all");
  const [sheetPriority, setSheetPriority] = useState<string>("all");

  const statusFilterOptions: FilterOption[] = [
    { label: "Todos", value: "all", count: 24 },
    { label: "Pendientes", value: "pending", icon: "time-outline", count: 8 },
    { label: "Aprobados", value: "approved", icon: "checkmark-circle-outline", count: 12 },
    { label: "Rechazados", value: "rejected", icon: "close-circle-outline", count: 3 },
    { label: "Archivados", value: "archived", icon: "archive-outline", count: 1 },
  ];

  const categoryFilterOptions: FilterOption[] = [
    { label: "Presupuesto", value: "presupuesto", icon: "wallet-outline" },
    { label: "Compras", value: "compras", icon: "cart-outline" },
    { label: "RRHH", value: "rrhh", icon: "people-outline" },
    { label: "Tecnología", value: "tecnologia", icon: "laptop-outline" },
    { label: "Legal", value: "legal", icon: "briefcase-outline" },
  ];

  const activeSheetFiltersCount =
    (sheetDepartment !== "all" ? 1 : 0) + (sheetPriority !== "all" ? 1 : 0);

  // Estados de Multimedia (Media)
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: number; mimeType: string; date: string }>>([
    { id: "1", name: "especificaciones_tecnicas.pdf", size: 3450000, mimeType: "application/pdf", date: "04 Oct 2026" },
    { id: "2", name: "cotizaciones_proveedores.xlsx", size: 1240000, mimeType: "application/vnd.ms-excel", date: "03 Oct 2026" },
    { id: "3", name: "foto_inspeccion_01.jpg", size: 4890000, mimeType: "image/jpeg", date: "02 Oct 2026" },
  ]);

  // Estados de Pantallas de Estado (States)
  const [activeStateTab, setActiveStateTab] = useState<"permission" | "unauthorized" | "notfound">("permission");

  // Estados de Micro-Animaciones (Animation Suite)
  const [animCardVariant, setAnimCardVariant] = useState<AnimatedCardVariant>("elevated");
  const [animCardEntrance, setAnimCardEntrance] = useState<AnimatedCardEntrance>("fadeUp");
  const [animCardClicks, setAnimCardClicks] = useState<number>(0);
  const [pulseActive, setPulseActive] = useState<boolean>(true);
  const [pulseType, setPulseType] = useState<PulseType>("both");
  const [slideVisible, setSlideVisible] = useState<boolean>(true);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("right");
  const [fadeVisible, setFadeVisible] = useState<boolean>(true);
  const [fadeDirection, setFadeDirection] = useState<FadeDirection>("up");
  const [scaleFactor, setScaleFactor] = useState<number>(0.95);

  const handleSimulateUpload = () => {
    setUploadProgress(0);
    setUploadStatus("uploading");
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus("success");
          setToastMessage({
            title: "Carga completada",
            message: "El archivo se ha subido con éxito al servidor.",
            variant: "success",
          });
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

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
        subtitle={`Galería interactiva móvil • Modo ${isDark ? "Oscuro" : "Claro"}`}
        bordered
        rightAction={
          <View style={styles.headerActions}>
            <AppIconButton
              icon={isDark ? "sunny-outline" : "moon-outline"}
              accessibilityLabel="Cambiar tema"
              variant="tonal"
              onPress={() => {
                toggleTheme();
                setToastMessage({
                  title: isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro",
                  message: `Se activó el tema ${isDark ? "claro" : "oscuro"}`,
                  variant: "info",
                });
              }}
            />
            <AppIconButton
              icon="notifications-outline"
              accessibilityLabel="Notificaciones"
              variant="ghost"
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
          </View>
        }
      />

      {/* Banner de Estado Offline */}
      <OfflineBanner
        visible={isOffline}
        onRetry={() => {
          setIsOffline(false);
          setToastMessage({
            title: "Reconectado",
            message: "Conexión a internet restaurada con éxito.",
            variant: "success",
          });
        }}
        onDismiss={() => setIsOffline(false)}
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
        {/* CONTROL DE MODO OSCURO (THEME SWITCHER)              */}
        {/* ==================================================== */}
        <AppCard variant="elevated" style={styles.gapSm}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={styles.flex1}>
              <AppText variant="subtitle">🌓 Apariencia y Modo Oscuro</AppText>
              <AppText variant="caption">
                Tema activo: <AppText variant="caption" style={{ fontWeight: "700" }}>{isDark ? "🌙 Oscuro (Dark)" : "☀️ Claro (Light)"}</AppText> • Preferencia: {themeMode.toUpperCase()}
              </AppText>
            </View>

            <AppBadge
              label={isDark ? "Dark Active" : "Light Active"}
              variant={isDark ? "primary" : "default"}
              appearance="solid"
            />
          </View>

          <View style={styles.chipRow}>
            <FilterChip
              label="☀️ Claro"
              selected={themeMode === "light"}
              variant="solid"
              onPress={() => {
                setThemeMode("light");
                setToastMessage({
                  title: "Modo Claro",
                  message: "Se fijó el tema claro",
                  variant: "info",
                });
              }}
            />
            <FilterChip
              label="🌙 Oscuro"
              selected={themeMode === "dark"}
              variant="solid"
              onPress={() => {
                setThemeMode("dark");
                setToastMessage({
                  title: "Modo Oscuro",
                  message: "Se fijó el tema oscuro",
                  variant: "info",
                });
              }}
            />
            <FilterChip
              label="⚙️ Automático (Sistema)"
              selected={themeMode === "system"}
              variant="subtle"
              onPress={() => {
                setThemeMode("system");
                setToastMessage({
                  title: "Tema Automático",
                  message: "El tema se adaptará al esquema del sistema operativo",
                  variant: "info",
                });
              }}
            />
          </View>
        </AppCard>

        {/* ==================================================== */}
        {/* SECCIÓN A: MENSAJES DE ESTADO (FEEDBACK BANNERS)     */}
        {/* ==================================================== */}
        <Section
          title="📣 Mensajes de Estado"
          description="SuccessMessage, WarningMessage, InfoMessage, ErrorState y OfflineBanner"
          rightAction={
            <AppButton
              title={isOffline ? "Quitar Offline" : "Simular Offline"}
              size="sm"
              variant={isOffline ? "primary" : "outline"}
              onPress={() => setIsOffline((prev) => !prev)}
            />
          }
          withDivider
        >
          {showInfoBanner ? (
            <InfoMessage
              title="Nueva Versión Disponible"
              message="Se ha publicado la versión v2.4 con mejoras de rendimiento y nuevos componentes."
              actionLabel="Ver notas"
              onAction={() => Alert.alert("Actualización", "Mostrando notas de la versión v2.4...")}
              onDismiss={() => setShowInfoBanner(false)}
            />
          ) : null}

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

          {/* 4. List Items with SwipeAction */}
          <AppText variant="subtitle" style={styles.mtMd}>
            Elementos de Lista con Deslizamiento (SwipeAction):
          </AppText>
          <View style={styles.gapSm}>
            <SwipeAction
              onEdit={() => Alert.alert("Editar", "Editando datos de Carlos Mendoza...")}
              onDelete={() => {
                setShowDangerModal(true);
              }}
            >
              <ListItem
                title="Carlos Mendoza"
                subtitle="Ingeniero de Software Senior (Desliza para acciones)"
                caption="Última actividad: hace 10 min"
                left={<AppAvatar name="Carlos Mendoza" size="md" online />}
                onPress={() => Alert.alert("Detalle", "Abriendo perfil de Carlos")}
              />
            </SwipeAction>

            <SwipeAction
              onEdit={() => Alert.alert("Editar", "Editando solicitud #SOL-8910...")}
              onDelete={() => setShowDangerModal(true)}
            >
              <ListItem
                title="Solicitud #SOL-8910"
                subtitle="Aprobación de presupuesto (Desliza ←)"
                variant="card"
                right={<AppBadge label="Pendiente" variant="warning" size="sm" />}
                onPress={() => Alert.alert("Detalle", "Abriendo solicitud")}
              />
            </SwipeAction>
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

          <View style={styles.buttonRow}>
            <AppButton
              title="Abrir ActionMenu"
              variant="outline"
              style={styles.flex1}
              onPress={() => setShowActionMenu(true)}
            />
            <AppButton
              title={fabExtended ? "FAB Compacto" : "FAB Extendido"}
              variant="ghost"
              style={styles.flex1}
              onPress={() => setFabExtended((prev) => !prev)}
            />
          </View>

          <AppButton
            title="Mostrar Loading Overlay (2s)"
            variant="outline"
            onPress={handleTriggerLoadingOverlay}
          />
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN G2: SELECTORES DE FECHA Y HORA (DATE & TIME) */}
        {/* ==================================================== */}
        <Section
          title="⏱️ Fecha y Hora (Pickers)"
          description="TimeInput (24h/12h con clear) y DateRangePicker con accesos directos"
          withDivider
        >
          <AppCard variant="outlined" style={styles.gapMd}>
            <AppText variant="subtitle">Entrada de Horas:</AppText>
            <View style={styles.buttonRow}>
              <View style={styles.flex1}>
                <TimeInput
                  label="Hora Inicio (24h)"
                  value={selectedTime}
                  is24Hour
                  clearable
                  hint="Formato militar 24h"
                  onChange={(date) => {
                    setSelectedTime(date);
                    if (date) {
                      setToastMessage({
                        variant: "info",
                        title: "Hora actualizada",
                        message: `Inicio: ${date.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}`,
                      });
                    }
                  }}
                />
              </View>
              <View style={styles.flex1}>
                <TimeInput
                  label="Hora Fin (12h)"
                  value={selectedTime12h}
                  is24Hour={false}
                  placeholder="Sin asignar"
                  clearable
                  hint="Formato AM/PM"
                  onChange={(date) => {
                    setSelectedTime12h(date);
                    if (date) {
                      setToastMessage({
                        variant: "info",
                        title: "Hora de Cierre",
                        message: `Fin: ${date.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", hour12: true })}`,
                      });
                    }
                  }}
                />
              </View>
            </View>

            <AppText variant="subtitle" style={styles.mtSm}>
              Selector de Rango de Fechas:
            </AppText>
            <DateRangePicker
              label="Período de Facturación / Reporte"
              value={dateRange}
              showPresets
              clearable
              hint="Usa los botones rápidos o toca cada fecha para personalizar"
              onChange={(newRange) => {
                setDateRange(newRange);
                if (newRange.startDate && newRange.endDate) {
                  setToastMessage({
                    variant: "success",
                    title: "Rango seleccionado",
                    message: `${newRange.startDate.toLocaleDateString("es-BO")} → ${newRange.endDate.toLocaleDateString("es-BO")}`,
                  });
                }
              }}
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN G3: CARGA DE ARCHIVOS Y MULTIMEDIA (UPLOAD) */}
        {/* ==================================================== */}
        <Section
          title="📁 Carga de Archivos y Multimedia (Upload)"
          description="AppFilePicker, AppImagePicker (tarjeta y avatar) y UploadProgress con simulación"
          withDivider
        >
          <AppCard variant="outlined" style={styles.gapMd}>
            {/* 1. Selector de Documentos */}
            <AppText variant="subtitle">1. Selector de Documentos (AppFilePicker):</AppText>
            <AppFilePicker
              label="Documento de Respaldo / Comprobante"
              required
              value={demoFile}
              maxSizeBytes={10 * 1024 * 1024}
              hint="Formatos admitidos: PDF, DOCX, XLSX, ZIP hasta 10 MB"
              onChange={(file) => {
                setDemoFile(file);
                if (file) {
                  setToastMessage({
                    title: "Archivo seleccionado",
                    message: `${file.name} (${(file.size ? (file.size / (1024 * 1024)).toFixed(2) : 0)} MB)`,
                    variant: "info",
                  });
                }
              }}
            />

            {/* 2. Selector de Imagen de Perfil (Avatar) */}
            <AppText variant="subtitle" style={styles.mtSm}>
              2. Foto de Perfil / Avatar (AppImagePicker en modo Avatar):
            </AppText>
            <AppImagePicker
              label="Avatar del Usuario"
              variant="avatar"
              value={demoAvatar}
              allowsEditing
              aspect={[1, 1]}
              hint="Toca Cámara o Galería para recortar en proporción 1:1"
              onChange={(img) => {
                setDemoAvatar(img);
                if (img) {
                  setToastMessage({
                    title: "Avatar actualizado",
                    message: "Foto de perfil cargada correctamente.",
                    variant: "success",
                  });
                }
              }}
            />

            {/* 3. Selector de Imagen (Tarjeta / Evidencia) */}
            <AppText variant="subtitle" style={styles.mtSm}>
              3. Imagen de Evidencia o Producto (AppImagePicker en modo Tarjeta):
            </AppText>
            <AppImagePicker
              label="Fotografía del Inmueble / Activo"
              required
              variant="card"
              value={demoImage}
              allowsEditing
              hint="Formatos JPG, PNG, WEBP de alta resolución"
              onChange={(img) => {
                setDemoImage(img);
                if (img) {
                  setToastMessage({
                    title: "Imagen adjunta",
                    message: `${img.fileName ?? "imagen.jpg"} lista para enviar`,
                    variant: "info",
                  });
                }
              }}
            />

            {/* 4. Barra de Progreso de Subida (UploadProgress) */}
            <AppText variant="subtitle" style={styles.mtSm}>
              4. Indicador de Progreso (UploadProgress):
            </AppText>
            <UploadProgress
              progress={uploadProgress}
              status={uploadStatus}
              fileName="expediente_auditoria_2026.zip"
              fileSize={14680064}
              speedText="1.8 MB/s"
              errorMessage="Conexión interrumpida por el servidor"
              onTogglePause={() => {
                setUploadStatus((prev) => (prev === "paused" ? "uploading" : "paused"));
              }}
              onRetry={handleSimulateUpload}
              onCancel={() => {
                setUploadProgress(0);
                setUploadStatus("paused");
                setToastMessage({
                  title: "Subida cancelada",
                  message: "La transferencia de archivo ha sido detenida.",
                  variant: "warning",
                });
              }}
            />

            {/* Controles de Simulación de Progreso */}
            <View style={[styles.buttonRow, styles.mtXs]}>
              <AppButton
                title="▶️ Simular Subida"
                variant="primary"
                size="sm"
                style={styles.flex1}
                onPress={handleSimulateUpload}
              />
              <AppButton
                title={uploadStatus === "paused" ? "Continuar" : "Pausar"}
                variant="secondary"
                size="sm"
                style={styles.flex1}
                onPress={() => {
                  setUploadStatus((prev) => (prev === "paused" ? "uploading" : "paused"));
                }}
              />
              <AppButton
                title="Simular Error"
                variant="danger"
                size="sm"
                style={styles.flex1}
                onPress={() => {
                  setUploadStatus("error");
                }}
              />
            </View>

            <AppText variant="caption" style={styles.mtXs}>
              Variante Compacta / En línea (Inline):
            </AppText>
            <UploadProgress
              variant="inline"
              progress={uploadProgress}
              status={uploadStatus}
              fileName="anexo_tecnico_v2.pdf"
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN G4: SISTEMA DE FILTROS (CHIPS, BAR & SHEET)  */}
        {/* ==================================================== */}
        <Section
          title="🏷️ Sistema de Filtros (Filters)"
          description="FilterBar, FilterChip (variantes, tamaños e íconos) y FilterSheet modal con secciones"
          withDivider
        >
          <AppCard variant="outlined" style={styles.gapMd}>
            {/* 1. Barra de Filtro de Estado con botón de Hoja de Filtros */}
            <AppText variant="subtitle">1. Barra de Filtros con Botón de Modal (Single-Select):</AppText>
            <FilterBar
              options={statusFilterOptions}
              value={selectedStatusFilter}
              activeFilterCount={activeSheetFiltersCount}
              onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
              onChange={(val) => {
                setSelectedStatusFilter(val);
                setToastMessage({
                  title: "Filtro aplicado",
                  message: `Estado seleccionado: ${statusFilterOptions.find((o) => o.value === val)?.label}`,
                  variant: "info",
                });
              }}
            />

            {/* 2. Barra de Filtros de Selección Múltiple */}
            <AppText variant="subtitle" style={styles.mtSm}>
              2. Selección Múltiple de Categorías (Multi-Select con botón Limpiar):
            </AppText>
            <FilterBar
              options={categoryFilterOptions}
              multiSelect
              values={selectedCategories}
              showClear
              onClear={() => {
                setSelectedCategories([]);
                setToastMessage({
                  title: "Filtros limpiados",
                  message: "Se desmarcaron todas las categorías",
                  variant: "warning",
                });
              }}
              onMultiChange={(vals) => {
                setSelectedCategories(vals);
              }}
            />

            {/* 3. Chips Removibles y Variantes */}
            <AppText variant="subtitle" style={styles.mtSm}>
              3. Chips Individuales (Tamaños y Variantes):
            </AppText>
            <View style={styles.chipRow}>
              <FilterChip
                label="Pequeño (sm)"
                size="sm"
                selected
                variant="subtle"
                onPress={() => {}}
              />
              <FilterChip
                label="Mediano (md)"
                size="md"
                selected
                variant="solid"
                icon="star"
                onPress={() => {}}
              />
              <FilterChip
                label="Grande (lg)"
                size="lg"
                icon="pricetag-outline"
                count={14}
                onPress={() => {}}
              />
              <FilterChip
                label="Filtro Removible"
                selected
                removable
                onRemove={() => {
                  setToastMessage({
                    title: "Filtro eliminado",
                    message: "Chip removido con éxito",
                    variant: "info",
                  });
                }}
                onPress={() => {}}
              />
            </View>

            {/* Botón para abrir FilterSheet */}
            <AppButton
              title={`⚙️ Abrir Filtros Avanzados (${activeSheetFiltersCount} activos)`}
              variant="secondary"
              size="sm"
              style={styles.mtXs}
              onPress={() => setIsFilterSheetOpen(true)}
            />
          </AppCard>
        </Section>

        {/* Modal FilterSheet */}
        <FilterSheet
          visible={isFilterSheetOpen}
          title="Filtros de Solicitudes"
          subtitle="Selecciona departamento y nivel de prioridad"
          activeCount={activeSheetFiltersCount}
          onClose={() => setIsFilterSheetOpen(false)}
          onClear={() => {
            setSheetDepartment("all");
            setSheetPriority("all");
            setToastMessage({
              title: "Filtros restablecidos",
              message: "Se limpiaron los criterios avanzados",
              variant: "info",
            });
          }}
          onApply={() => {
            setIsFilterSheetOpen(false);
            setToastMessage({
              title: "Filtros guardados",
              message: `Dpto: ${sheetDepartment.toUpperCase()} | Prioridad: ${sheetPriority.toUpperCase()}`,
              variant: "success",
            });
          }}
        >
          {/* Sección 1: Departamento */}
          <FilterSection
            title="Departamento Solicitante"
            subtitle="Filtra por área administrativa"
            onResetSection={() => setSheetDepartment("all")}
          >
            <View style={styles.chipRow}>
              {["all", "finanzas", "operaciones", "tecnología", "legal"].map((dept) => (
                <FilterChip
                  key={dept}
                  label={dept === "all" ? "Todos" : dept.charAt(0).toUpperCase() + dept.slice(1)}
                  selected={sheetDepartment === dept}
                  onPress={() => setSheetDepartment(dept)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Sección 2: Prioridad */}
          <FilterSection
            title="Nivel de Prioridad"
            subtitle="Urgencia de atención requerida"
            onResetSection={() => setSheetPriority("all")}
          >
            <View style={styles.chipRow}>
              {[
                { id: "all", label: "Todas" },
                { id: "baja", label: "🟢 Baja" },
                { id: "media", label: "🟡 Media" },
                { id: "alta", label: "🔴 Alta / Urgente" },
              ].map((p) => (
                <FilterChip
                  key={p.id}
                  label={p.label}
                  selected={sheetPriority === p.id}
                  variant="solid"
                  onPress={() => setSheetPriority(p.id)}
                />
              ))}
            </View>
          </FilterSection>
        </FilterSheet>

        {/* ==================================================== */}
        {/* SECCIÓN G5: MULTIMEDIA Y ADJUNTOS (MEDIA)            */}
        {/* ==================================================== */}
        <Section
          title="📸 Multimedia y Archivos Adjuntos (Media)"
          description="AvatarPicker (con cámara/galería), AttachmentItem (gestión de archivos) e ImagePreview"
          withDivider
        >
          <AppCard variant="outlined" style={styles.gapMd}>
            {/* 1. Avatar Picker */}
            <AppText variant="subtitle">1. Selector de Avatar (AvatarPicker):</AppText>
            <AvatarPicker
              name="Carlos Mendoza"
              uri={avatarUri}
              size={96}
              hint="Toca la foto o el ícono de cámara para cambiar tu avatar"
              onChange={(newUri) => {
                setAvatarUri(newUri);
                setToastMessage({
                  title: "Avatar actualizado",
                  message: "Se ha asignado una nueva foto de perfil",
                  variant: "success",
                });
              }}
              onRemove={() => {
                setAvatarUri(undefined);
                setToastMessage({
                  title: "Avatar eliminado",
                  message: "Se restauró el avatar por iniciales",
                  variant: "info",
                });
              }}
            />

            {/* 2. Lista de Adjuntos */}
            <AppText variant="subtitle" style={styles.mtSm}>
              2. Lista de Archivos Adjuntos (AttachmentItem):
            </AppText>
            <View style={styles.gapSm}>
              {attachments.map((item) => (
                <AttachmentItem
                  key={item.id}
                  name={item.name}
                  size={item.size}
                  mimeType={item.mimeType}
                  date={item.date}
                  onPress={() => {
                    if (item.mimeType.startsWith("image/")) {
                      setPreviewImageUri("https://picsum.photos/800/1000");
                      setIsPreviewOpen(true);
                    } else {
                      setToastMessage({
                        title: "Visualizar archivo",
                        message: `Abriendo vista previa de ${item.name}`,
                        variant: "info",
                      });
                    }
                  }}
                  onDownload={() => {
                    setToastMessage({
                      title: "Descarga iniciada",
                      message: `Descargando ${item.name} al almacenamiento local...`,
                      variant: "success",
                    });
                  }}
                  onRemove={() => {
                    setAttachments((prev) => prev.filter((a) => a.id !== item.id));
                    setToastMessage({
                      title: "Adjunto eliminado",
                      message: `Se quitó ${item.name}`,
                      variant: "warning",
                    });
                  }}
                />
              ))}
            </View>

            <AppText variant="caption">
              💡 Toca el archivo JPG para abrir el visor a pantalla completa (ImagePreview).
            </AppText>
          </AppCard>
        </Section>

        {/* Modal Visor de Imagen a Pantalla Completa */}
        <ImagePreview
          visible={isPreviewOpen}
          uri={previewImageUri ?? undefined}
          title="Inspección de Obra - Módulo B"
          subtitle="Capturado el 02 de Octubre, 2026 • 4.89 MB"
          onClose={() => setIsPreviewOpen(false)}
          onShare={() => {
            setToastMessage({
              title: "Compartir",
              message: "Enlace de descarga copiado al portapapeles",
              variant: "info",
            });
          }}
          onDownload={() => {
            setToastMessage({
              title: "Guardado en Galería",
              message: "La imagen se guardó correctamente",
              variant: "success",
            });
          }}
          onDelete={() => {
            setIsPreviewOpen(false);
            setAttachments((prev) => prev.filter((a) => a.id !== "3"));
            setToastMessage({
              title: "Imagen eliminada",
              message: "Se ha eliminado la fotografía de inspección",
              variant: "warning",
            });
          }}
        />

        {/* ==================================================== */}
        {/* SECCIÓN G6: GEOLOCALIZACIÓN Y GPS (LOCATION)         */}
        {/* ==================================================== */}
        <Section
          title="📍 Geolocalización y Permisos (Location)"
          description="LocationPermission con detección de estado, beneficios y obtención de coordenadas GPS"
          withDivider
        >
          <AppCard variant="outlined" style={styles.gapMd}>
            <LocationPermission
              title="Autorizar GPS para Auditorías"
              description="Es necesario registrar tus coordenadas de campo al firmar actas de recepción de bienes."
              onGranted={(coords) => {
                setToastMessage({
                  title: "Ubicación obtenida",
                  message: coords
                    ? `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`
                    : "GPS habilitado correctamente",
                  variant: "success",
                });
              }}
              onDenied={() => {
                setToastMessage({
                  title: "Permiso denegado",
                  message: "La ubicación no fue autorizada",
                  variant: "warning",
                });
              }}
            />
          </AppCard>
        </Section>

        {/* ==================================================== */}
        {/* SECCIÓN G7: PANTALLAS DE ESTADO (STATES)             */}
        {/* ==================================================== */}
        <Section
          title="🛡️ Pantallas y Vistas de Estado (States)"
          description="PermissionState, UnauthorizedState (403) y NotFoundState (404)"
          withDivider
        >
          <AppCard variant="outlined" style={styles.gapMd}>
            <AppText variant="subtitle">Selector de Vista de Estado:</AppText>
            <View style={styles.chipRow}>
              <FilterChip
                label="🔒 Permiso Requerido"
                selected={activeStateTab === "permission"}
                onPress={() => setActiveStateTab("permission")}
              />
              <FilterChip
                label="🚫 403 No Autorizado"
                selected={activeStateTab === "unauthorized"}
                onPress={() => setActiveStateTab("unauthorized")}
              />
              <FilterChip
                label="🔍 404 No Encontrado"
                selected={activeStateTab === "notfound"}
                onPress={() => setActiveStateTab("notfound")}
              />
            </View>

            {activeStateTab === "permission" && (
              <PermissionState
                title="Acceso a Notificaciones"
                message="Activa las alertas automáticas para recibir avisos cuando se apruebe una solicitud."
                buttonText="Activar Notificaciones Push"
                onPress={() => {
                  setToastMessage({
                    title: "Permiso solicitado",
                    message: "Solicitud de notificaciones enviada",
                    variant: "info",
                  });
                }}
              />
            )}

            {activeStateTab === "unauthorized" && (
              <UnauthorizedState
                title="Módulo Restringido"
                message="Tu rol actual de usuario no tiene acceso a la tesorería central."
                onBack={() => {
                  setToastMessage({
                    title: "Regresando",
                    message: "Redirigido a la vista pública",
                    variant: "info",
                  });
                }}
                onRequestAccess={() => {
                  setToastMessage({
                    title: "Ticket de acceso enviado",
                    message: "Se envió la petición al administrador de seguridad",
                    variant: "success",
                  });
                }}
              />
            )}

            {activeStateTab === "notfound" && (
              <NotFoundState
                title="Solicitud #SOL-9989 No Encontrada"
                message="El identificador ingresado no coincide con ningún trámite activo o archivado."
                backLabel="Ver Todas las Solicitudes"
                onBack={() => {
                  setToastMessage({
                    title: "Navegación",
                    message: "Redirigiendo a la bandeja de entrada",
                    variant: "info",
                  });
                }}
                onRetry={() => {
                  setToastMessage({
                    title: "Búsqueda reiniciada",
                    message: "Consultando índices de base de datos...",
                    variant: "info",
                  });
                }}
              />
            )}
          </AppCard>
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

        {/* ==================================================== */}
        {/* SECCIÓN G8: MICRO-ANIMACIONES Y TRANSICIONES         */}
        {/* ==================================================== */}
        <Section
          title="🎬 G8. Micro-animaciones y Transiciones"
          description="Componentes animados fluidos con React Native Reanimated (AnimatedCard, PulseView, ScalePressable, SlideInView, FadeInView)."
        >
          {/* G8.1 AnimatedCard con Efectos de Toque y Entrada */}
          <AppCard variant="elevated" style={styles.gapMd}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={styles.flex1}>
                <AppText variant="subtitle">1. AnimatedCard (Tarjetas con Spring)</AppText>
                <AppText variant="caption">
                  Toca las tarjetas para sentir el rebote físico con spring. Taps: {animCardClicks}
                </AppText>
              </View>
              <AppBadge
                label={`${animCardClicks} taps`}
                variant="primary"
                appearance="solid"
                dot
              />
            </View>

            {/* Controles de Variante de Tarjeta */}
            <AppText variant="caption" style={{ fontWeight: "600" }}>Variante de Tarjeta:</AppText>
            <View style={styles.chipRow}>
              {(["elevated", "outlined", "filled", "default"] as AnimatedCardVariant[]).map((v) => (
                <FilterChip
                  key={v}
                  label={v.toUpperCase()}
                  selected={animCardVariant === v}
                  variant="solid"
                  onPress={() => setAnimCardVariant(v)}
                />
              ))}
            </View>

            {/* Controles de Entrada */}
            <AppText variant="caption" style={{ fontWeight: "600" }}>Animación de Entrada:</AppText>
            <View style={styles.chipRow}>
              {(["fadeUp", "fadeIn", "zoom", "none"] as AnimatedCardEntrance[]).map((e) => (
                <FilterChip
                  key={e}
                  label={e}
                  selected={animCardEntrance === e}
                  variant="outline"
                  onPress={() => setAnimCardEntrance(e)}
                />
              ))}
            </View>

            {/* Grid de AnimatedCards con Delay Escalonado */}
            <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
              <AnimatedCard
                key={`card-1-${animCardVariant}-${animCardEntrance}`}
                variant={animCardVariant}
                entrance={animCardEntrance}
                delay={0}
                onPress={() => {
                  setAnimCardClicks((c) => c + 1);
                  setToastMessage({
                    title: "Tarjeta #1 Presionada",
                    message: "Efecto spring con Reanimated activado",
                    variant: "info",
                  });
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radius.md,
                      backgroundColor: colors.primaryLight,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="sparkles" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.flex1}>
                    <AppText variant="subtitle">Servicio de Nube Activo</AppText>
                    <AppText variant="caption">Latencia 12ms • Región us-east-1</AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </AnimatedCard>

              <AnimatedCard
                key={`card-2-${animCardVariant}-${animCardEntrance}`}
                variant={animCardVariant}
                entrance={animCardEntrance}
                delay={100}
                onPress={() => {
                  setAnimCardClicks((c) => c + 1);
                  setToastMessage({
                    title: "Tarjeta #2 Presionada",
                    message: "Aprobación de presupuesto registrada",
                    variant: "success",
                  });
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radius.md,
                      backgroundColor: "#DCFCE7",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="shield-checkmark" size={22} color={colors.success} />
                  </View>
                  <View style={styles.flex1}>
                    <AppText variant="subtitle">Auditoría de Seguridad</AppText>
                    <AppText variant="caption">100% de cumplimiento en normativas</AppText>
                  </View>
                  <AppBadge label="OK" variant="success" size="sm" />
                </View>
              </AnimatedCard>
            </View>
          </AppCard>

          {/* G8.2 ScalePressable - Botones y Elementos Táctiles con Escala */}
          <AppCard variant="elevated" style={styles.gapMd}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={styles.flex1}>
                <AppText variant="subtitle">2. ScalePressable (Toques Reactivos)</AppText>
                <AppText variant="caption">
                  Respuesta inmediata al presionar (press-in/out) con física de resorte.
                </AppText>
              </View>
              <AppBadge label={`Scale: ${scaleFactor}`} variant="default" size="sm" />
            </View>

            <AppText variant="caption" style={{ fontWeight: "600" }}>Intensidad de Escala:</AppText>
            <View style={styles.chipRow}>
              {[0.97, 0.94, 0.90, 0.85].map((s) => (
                <FilterChip
                  key={s}
                  label={`${Math.round(s * 100)}%`}
                  selected={scaleFactor === s}
                  variant="solid"
                  onPress={() => setScaleFactor(s)}
                />
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xs }}>
              <ScalePressable
                activeScale={scaleFactor}
                onPress={() => {
                  setToastMessage({
                    title: "ScalePressable Acción Principal",
                    message: `Pulsado con escala ${scaleFactor}`,
                    variant: "info",
                  });
                }}
                style={{
                  flex: 1,
                  padding: spacing.md,
                  backgroundColor: colors.primary,
                  borderRadius: radius.md,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="rocket-outline" size={18} color={colors.white} />
                <AppText variant="bodySm" style={{ color: colors.white, fontWeight: "600" }}>
                  Botón Primario
                </AppText>
              </ScalePressable>

              <ScalePressable
                activeScale={scaleFactor}
                onPress={() => {
                  setToastMessage({
                    title: "ScalePressable Acción Secundaria",
                    message: "Feedback de resorte ejecutado",
                    variant: "info",
                  });
                }}
                style={{
                  flex: 1,
                  padding: spacing.md,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: spacing.xs,
                }}
              >
                <Ionicons name="flash-outline" size={18} color={colors.text} />
                <AppText variant="bodySm" style={{ fontWeight: "600" }}>
                  Secundario
                </AppText>
              </ScalePressable>
            </View>
          </AppCard>

          {/* G8.3 PulseView - Balizas y Estados Vivos */}
          <AppCard variant="elevated" style={styles.gapMd}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={styles.flex1}>
                <AppText variant="subtitle">3. PulseView (Balizas y Alertas Pulsantes)</AppText>
                <AppText variant="caption">
                  Animación cíclica suave para elementos en vivo o notificaciones urgentes.
                </AppText>
              </View>
              <AppSwitch
                value={pulseActive}
                onValueChange={(val) => setPulseActive(val)}
                label=""
              />
            </View>

            <AppText variant="caption" style={{ fontWeight: "600" }}>Tipo de Pulso:</AppText>
            <View style={styles.chipRow}>
              {(["both", "opacity", "scale"] as PulseType[]).map((t) => (
                <FilterChip
                  key={t}
                  label={t.toUpperCase()}
                  selected={pulseType === t}
                  variant="solid"
                  onPress={() => setPulseType(t)}
                />
              ))}
            </View>

            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              <PulseView active={pulseActive} type={pulseType} duration={1200}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
                    padding: spacing.md,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.danger,
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.danger,
                    }}
                  />
                  <AppText variant="bodySm" style={{ color: colors.danger, fontWeight: "700", flex: 1 }}>
                    🔴 ALERTA EN VIVO: Servidor en Alta Demanda
                  </AppText>
                  <AppBadge label="Live" variant="danger" size="sm" appearance="solid" />
                </View>
              </PulseView>

              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <PulseView active={pulseActive} type={pulseType} duration={1000} style={{ flex: 1 }}>
                  <View
                    style={{
                      padding: spacing.sm,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.xs,
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
                    <AppText variant="caption" style={{ fontWeight: "600" }}>
                      🟢 GPS Activo
                    </AppText>
                  </View>
                </PulseView>

                <PulseView active={pulseActive} type={pulseType} duration={1500} style={{ flex: 1 }}>
                  <View
                    style={{
                      padding: spacing.sm,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.xs,
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                    <AppText variant="caption" style={{ fontWeight: "600" }}>
                      ⚡ Sync Automático
                    </AppText>
                  </View>
                </PulseView>
              </View>
            </View>
          </AppCard>

          {/* G8.4 SlideInView & FadeInView - Transiciones Direccionales */}
          <AppCard variant="elevated" style={styles.gapMd}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={styles.flex1}>
                <AppText variant="subtitle">4. SlideInView & FadeInView</AppText>
                <AppText variant="caption">
                  Entradas y salidas animadas direccionales (Left, Right, Top, Bottom).
                </AppText>
              </View>
              <AppButton
                title={slideVisible ? "Ocultar" : "Mostrar"}
                variant="outline"
                size="sm"
                onPress={() => {
                  setSlideVisible((v) => !v);
                  setFadeVisible((v) => !v);
                }}
              />
            </View>

            <AppText variant="caption" style={{ fontWeight: "600" }}>Dirección de Desplazamiento (Slide):</AppText>
            <View style={styles.chipRow}>
              {(["left", "right", "top", "bottom"] as SlideDirection[]).map((d) => (
                <FilterChip
                  key={d}
                  label={d.toUpperCase()}
                  selected={slideDirection === d}
                  variant="solid"
                  onPress={() => setSlideDirection(d)}
                />
              ))}
            </View>

            <AppText variant="caption" style={{ fontWeight: "600" }}>Dirección de Fade:</AppText>
            <View style={styles.chipRow}>
              {(["up", "down", "left", "right", "none"] as FadeDirection[]).map((f) => (
                <FilterChip
                  key={f}
                  label={f.toUpperCase()}
                  selected={fadeDirection === f}
                  variant="outline"
                  onPress={() => setFadeDirection(f)}
                />
              ))}
            </View>

            <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
              {slideVisible ? (
                <SlideInView direction={slideDirection} exitDirection="left" spring duration={350}>
                  <View
                    style={{
                      padding: spacing.md,
                      backgroundColor: colors.surfaceSecondary,
                      borderRadius: radius.md,
                      borderLeftWidth: 4,
                      borderLeftColor: colors.primary,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.md,
                    }}
                  >
                    <Ionicons name="paper-plane" size={24} color={colors.primary} />
                    <View style={styles.flex1}>
                      <AppText variant="subtitle">Mensaje Deslizante (SlideInView)</AppText>
                      <AppText variant="caption">
                        Entrando desde la dirección: {slideDirection.toUpperCase()} con física de resorte
                      </AppText>
                    </View>
                  </View>
                </SlideInView>
              ) : null}

              {fadeVisible ? (
                <FadeInView direction={fadeDirection} exitDirection="fade" duration={300} spring>
                  <View
                    style={{
                      padding: spacing.md,
                      backgroundColor: isDark ? colors.surface : colors.background,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.md,
                    }}
                  >
                    <Ionicons name="color-wand-outline" size={24} color={colors.warning} />
                    <View style={styles.flex1}>
                      <AppText variant="subtitle">Elemento Difuminado (FadeInView)</AppText>
                      <AppText variant="caption">
                        Transición Fade Dirección: {fadeDirection.toUpperCase()}
                      </AppText>
                    </View>
                    <AppBadge label="Smooth" variant="warning" size="sm" />
                  </View>
                </FadeInView>
              ) : null}
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

      {/* ActionMenu Bottom Sheet Modal */}
      <ActionMenu
        visible={showActionMenu}
        title="Acciones Rápidas"
        subtitle="Selecciona una opción para continuar"
        actions={[
          {
            id: "new_solicitud",
            label: "Crear Nueva Solicitud",
            subtitle: "Iniciar trámite de compra o servicio",
            icon: "add-circle-outline",
            badge: "Nuevo",
            badgeVariant: "primary",
            onPress: () => {
              setToastMessage({
                variant: "success",
                title: "Nueva solicitud",
                message: "Formulario de solicitud iniciado",
              });
            },
          },
          {
            id: "export_data",
            label: "Exportar Reporte PDF",
            subtitle: "Descargar métricas del mes",
            icon: "download-outline",
            onPress: () => {
              setToastMessage({
                variant: "info",
                title: "Descarga iniciada",
                message: "Generando reporte de solicitudes...",
              });
            },
          },
          {
            id: "sync",
            label: "Sincronizar Datos",
            subtitle: "Actualizar con el servidor",
            icon: "sync-outline",
            onPress: () => {
              handleTriggerLoadingOverlay();
            },
          },
          {
            id: "delete_batch",
            label: "Limpiar Notificaciones",
            icon: "trash-outline",
            danger: true,
            onPress: () => {
              setNotificationCount(0);
              setToastMessage({
                variant: "warning",
                title: "Notificaciones",
                message: "Se han limpiado todas las notificaciones",
              });
            },
          },
        ]}
        onClose={() => setShowActionMenu(false)}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="add"
        label={fabExtended ? "Nueva Solicitud" : undefined}
        badgeCount={notificationCount}
        accessibilityLabel="Crear solicitud o abrir menú de acciones"
        onPress={() => setShowActionMenu(true)}
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
    marginTop: spacing.sm,
  },
  mtXs: {
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