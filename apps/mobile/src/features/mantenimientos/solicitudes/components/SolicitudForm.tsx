import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
    AlertCircleIcon,
    BoxesIcon,
    CalendarIcon,
    CheckIcon,
    ChevronRightIcon,
    UserIcon,
    WrenchIcon,
} from "@/src/components/icons";
import {
    FormField,
    ScreenHeader,
    SelectModal,
} from "@/src/components/common";
import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/src/components/ui/alert-dialog";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";
import {
    useActivosQuery,
    useEmpleadosQuery,
    usePrioridadesQuery,
    useTiposMantenimientoQuery,
} from "../hooks/use-solicitudes";
import {
    CreateSolicitudFormValues,
    createSolicitudSchema,
    defaultCreateSolicitudValues,
} from "../schemas/solicitud.schema";
import {
    SolicitudActivoInfo,
    SolicitudEmpleadoInfo,
} from "../types/solicitud.types";

export interface SolicitudFormProps {
    mode: "create" | "edit";
    initialValues?: Partial<CreateSolicitudFormValues>;
    initialActivo?: SolicitudActivoInfo;
    initialSolicitante?: SolicitudEmpleadoInfo;
    title?: string;
    subtitle?: string;
    submitButtonLabel?: string;
    successDialogTitle?: string;
    successDialogDescription?: string;
    onSubmit: (values: CreateSolicitudFormValues) => Promise<void>;
    isLoadingSubmission?: boolean;
}

export function SolicitudForm({
    mode,
    initialValues,
    initialActivo,
    initialSolicitante,
    title,
    subtitle,
    submitButtonLabel,
    successDialogTitle,
    successDialogDescription,
    onSubmit,
    isLoadingSubmission = false,
}: SolicitudFormProps) {
    const insets = useSafeAreaInsets();
    const isEdit = mode === "edit";

    const [formError, setFormError] = useState<string | null>(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    // Catálogos
    const { data: tiposPage, isLoading: loadingTipos } = useTiposMantenimientoQuery();
    const { data: prioridadesPage, isLoading: loadingPrioridades } = usePrioridadesQuery();
    const { data: activosPage, isLoading: loadingActivos } = useActivosQuery();
    const { data: empleadosPage, isLoading: loadingEmpleados } = useEmpleadosQuery();

    const tiposMantenimiento = useMemo(() => tiposPage?.content ?? [], [tiposPage?.content]);
    const prioridades = useMemo(() => prioridadesPage?.content ?? [], [prioridadesPage?.content]);
    const activos = useMemo(() => activosPage?.content ?? [], [activosPage?.content]);
    const empleados = useMemo(() => empleadosPage?.content ?? [], [empleadosPage?.content]);

    // Modales de selección
    const [modalActivoVisible, setModalActivoVisible] = useState(false);
    const [modalEmpleadoVisible, setModalEmpleadoVisible] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateSolicitudFormValues>({
        resolver: zodResolver(createSolicitudSchema),
        defaultValues: {
            ...defaultCreateSolicitudValues,
            ...initialValues,
        },
        mode: "onTouched",
    });

    // En modo edición o cuando initialValues cambie, actualizar valores del form
    useEffect(() => {
        if (initialValues) {
            reset({
                ...defaultCreateSolicitudValues,
                ...initialValues,
            });
        }
    }, [initialValues, reset]);

    const selectedActivoId = watch("activoId");
    const selectedTipoId = watch("tipoMantenimientoId");
    const selectedPrioridadId = watch("prioridadId");
    const selectedSolicitanteId = watch("solicitanteId");

    // Autoselección por defecto solo en modo creación
    useEffect(() => {
        if (!isEdit && tiposMantenimiento.length > 0 && !selectedTipoId) {
            setValue("tipoMantenimientoId", tiposMantenimiento[0].id, { shouldValidate: true });
        }
    }, [isEdit, tiposMantenimiento, selectedTipoId, setValue]);

    useEffect(() => {
        if (!isEdit && prioridades.length > 0 && !selectedPrioridadId) {
            setValue("prioridadId", prioridades[0].id, { shouldValidate: true });
        }
    }, [isEdit, prioridades, selectedPrioridadId, setValue]);

    useEffect(() => {
        if (!isEdit && empleados.length > 0 && !selectedSolicitanteId) {
            setValue("solicitanteId", empleados[0].id, { shouldValidate: true });
        }
    }, [isEdit, empleados, selectedSolicitanteId, setValue]);

    const selectedActivo =
        activos.find((a) => a.id === selectedActivoId) ||
        (initialActivo?.id === selectedActivoId ? initialActivo : undefined);

    const selectedEmpleado =
        empleados.find((e) => e.id === selectedSolicitanteId) ||
        (initialSolicitante?.id === selectedSolicitanteId ? initialSolicitante : undefined);

    const handleFormSubmit = async (values: CreateSolicitudFormValues) => {
        setFormError(null);
        try {
            await onSubmit(values);
            setSuccessDialogOpen(true);
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo guardar la solicitud de mantenimiento. Por favor revisa los campos.";
            setFormError(msg);
        }
    };

    const isPending = isSubmitting || isLoadingSubmission;

    const screenTitle = title ?? (isEdit ? "Editar Solicitud" : "Nueva Solicitud");
    const screenSubtitle = subtitle ?? (isEdit ? "Modificar requerimiento" : "Mantenimiento");
    const buttonText = submitButtonLabel ?? (isEdit ? "Guardar Cambios" : "Crear Solicitud");
    const dialogTitle = successDialogTitle ?? (isEdit ? "Solicitud Actualizada" : "Solicitud Registrada");
    const dialogDesc =
        successDialogDescription ??
        (isEdit
            ? "Los cambios de la solicitud de mantenimiento se han guardado exitosamente."
            : "La solicitud de mantenimiento ha sido registrada exitosamente.");

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-slate-100"
        >
            {/* Standard Screen Header */}
            <ScreenHeader
                title={screenTitle}
                subtitle={screenSubtitle}
                rightAction={{
                    label: "Guardar",
                    onPress: handleSubmit(handleFormSubmit),
                    loading: isPending,
                    disabled: isPending,
                    variant: "secondary",
                }}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    padding: 16,
                    paddingBottom: Math.max(insets.bottom, 24) + 90,
                    gap: 16,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Banner de Error (si existe) */}
                {formError && (
                    <View className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 flex-row items-start gap-2.5 shadow-2xs">
                        <AlertCircleIcon size={18} color="#e11d48" />
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-rose-800">
                                Revisa los campos requeridos
                            </Text>
                            <Text className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                                {formError}
                            </Text>
                        </View>
                    </View>
                )}

                {/* GRUPO 1: DETALLE DEL PROBLEMA */}
                <View className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
                    <View className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                        <Text className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Detalle del Problema
                        </Text>
                    </View>

                    <View className="p-4 gap-3.5">
                        <Controller
                            control={control}
                            name="titulo"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Título del Requerimiento"
                                    required
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    placeholder="Ej. Fuga de aceite en turbina principal"
                                    error={errors.titulo?.message}
                                    maxLength={150}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="descripcion"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Descripción Técnica"
                                    required
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    placeholder="Describe el síntoma, impacto operacional o requerimiento técnico..."
                                    error={errors.descripcion?.message}
                                    maxLength={2000}
                                    multiline
                                    numberOfLines={3}
                                />
                            )}
                        />
                    </View>
                </View>

                {/* GRUPO 2: EQUIPO Y CLASIFICACIÓN */}
                <View className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
                    <View className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                        <Text className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Equipo y Clasificación
                        </Text>
                    </View>

                    {/* Fila 1: Activo Selector */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setModalActivoVisible(true)}
                        className={`p-4 flex-row items-center justify-between border-b border-slate-100 ${
                            errors.activoId ? "bg-rose-50/30" : "active:bg-slate-50"
                        }`}
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <View className="h-8 w-8 items-center justify-center rounded-xl bg-orange-50 border border-orange-200">
                                <BoxesIcon size={16} color="#ea580c" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-700">
                                    Equipo / Activo *
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    className={`text-sm mt-0.5 ${
                                        selectedActivo
                                            ? "font-bold text-slate-900"
                                            : "font-medium text-slate-400"
                                    }`}
                                >
                                    {selectedActivo
                                        ? `${selectedActivo.codigo ? `${selectedActivo.codigo} • ` : ""}${selectedActivo.nombre}`
                                        : "Tocar para seleccionar equipo..."}
                                </Text>
                            </View>
                        </View>
                        <ChevronRightIcon size={16} color="#94a3b8" />
                    </TouchableOpacity>
                    {errors.activoId && (
                        <View className="px-4 pb-2 flex-row items-center gap-1.5">
                            <AlertCircleIcon size={12} color="#e11d48" />
                            <Text className="text-[11px] font-medium text-rose-600">
                                {errors.activoId.message}
                            </Text>
                        </View>
                    )}

                    {/* Fila 2: Tipo de Mantenimiento */}
                    <View className="p-4 border-b border-slate-100">
                        <Text className="text-xs font-bold text-slate-700 mb-2">
                            Tipo de Mantenimiento *
                        </Text>
                        {loadingTipos ? (
                            <ActivityIndicator size="small" color="#2563eb" className="py-1" />
                        ) : (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 8 }}
                            >
                                {tiposMantenimiento.map((tipo) => {
                                    const isSelected = selectedTipoId === tipo.id;
                                    return (
                                        <TouchableOpacity
                                            key={tipo.id}
                                            activeOpacity={0.7}
                                            onPress={() =>
                                                setValue("tipoMantenimientoId", tipo.id, {
                                                    shouldValidate: true,
                                                })
                                            }
                                            className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 border shadow-2xs ${
                                                isSelected
                                                    ? "bg-slate-900 border-slate-900"
                                                    : "bg-slate-50 border-slate-200"
                                            }`}
                                        >
                                            <WrenchIcon
                                                size={12}
                                                color={isSelected ? "#ffffff" : "#64748b"}
                                            />
                                            <Text
                                                className={`text-xs font-bold ${
                                                    isSelected ? "text-white" : "text-slate-700"
                                                }`}
                                            >
                                                {tipo.nombre}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>

                    {/* Fila 3: Nivel de Prioridad */}
                    <View className="p-4">
                        <Text className="text-xs font-bold text-slate-700 mb-2">
                            Nivel de Prioridad *
                        </Text>
                        {loadingPrioridades ? (
                            <ActivityIndicator size="small" color="#2563eb" className="py-1" />
                        ) : (
                            <View className="flex-row gap-2">
                                {prioridades.map((prio) => {
                                    const isSelected = selectedPrioridadId === prio.id;
                                    const isUrgente =
                                        prio.nombre.toLowerCase().includes("urgente") ||
                                        prio.nombre.toLowerCase().includes("critica") ||
                                        prio.nivel >= 4;
                                    const isAlta =
                                        prio.nombre.toLowerCase().includes("alta") || prio.nivel === 3;

                                    return (
                                        <TouchableOpacity
                                            key={prio.id}
                                            activeOpacity={0.7}
                                            onPress={() =>
                                                setValue("prioridadId", prio.id, {
                                                    shouldValidate: true,
                                                })
                                            }
                                            className={`flex-1 items-center justify-center rounded-xl py-2 border shadow-2xs ${
                                                isSelected
                                                    ? isUrgente
                                                        ? "bg-rose-600 border-rose-600"
                                                        : isAlta
                                                        ? "bg-amber-500 border-amber-500"
                                                        : "bg-blue-600 border-blue-600"
                                                    : "bg-slate-50 border-slate-200"
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-bold ${
                                                    isSelected ? "text-white" : "text-slate-700"
                                                }`}
                                            >
                                                {prio.nombre}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                </View>

                {/* GRUPO 3: SOLICITANTE Y DETALLES */}
                <View className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
                    <View className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                        <Text className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Personal y Detalles
                        </Text>
                    </View>

                    {/* Solicitante Selector Row */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setModalEmpleadoVisible(true)}
                        className={`p-4 flex-row items-center justify-between border-b border-slate-100 ${
                            errors.solicitanteId ? "bg-rose-50/30" : "active:bg-slate-50"
                        }`}
                    >
                        <View className="flex-row items-center gap-3 flex-1 mr-2">
                            <View className="h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200">
                                <UserIcon size={16} color="#2563eb" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-slate-700">
                                    Personal Solicitante *
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    className={`text-sm mt-0.5 ${
                                        selectedEmpleado
                                            ? "font-bold text-slate-900"
                                            : "font-medium text-slate-400"
                                    }`}
                                >
                                    {selectedEmpleado
                                        ? selectedEmpleado.nombreCompleto || selectedEmpleado.nombre || `Empleado ${selectedEmpleado.codigo || ""}`
                                        : "Tocar para seleccionar solicitante..."}
                                </Text>
                                {selectedEmpleado?.cargo && (
                                    <Text className="text-[11px] text-slate-400">
                                        {selectedEmpleado.cargo}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <ChevronRightIcon size={16} color="#94a3b8" />
                    </TouchableOpacity>

                    {/* Falla o Síntoma Detectado */}
                    <View className="p-4 border-b border-slate-100">
                        <Controller
                            control={control}
                            name="tipoFallas"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <FormField
                                    label="Falla o Síntoma Detectado (Opcional)"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    placeholder="Ej. Sobrecalentamiento, ruido anormal, vibración"
                                    maxLength={200}
                                />
                            )}
                        />
                    </View>
                </View>

                {/* BOTÓN INFERIOR DE ACCIÓN */}
                <View className="pt-2 pb-6">
                    <Button
                        size="xl"
                        variant="solid"
                        action="primary"
                        onPress={handleSubmit(handleFormSubmit)}
                        disabled={isPending}
                        className="bg-blue-600 rounded-2xl shadow-md active:bg-blue-700"
                    >
                        {isPending ? (
                            <ButtonSpinner color="#ffffff" />
                        ) : (
                            <ButtonText className="text-base font-bold text-white">
                                {buttonText}
                            </ButtonText>
                        )}
                    </Button>
                </View>
            </ScrollView>

            {/* MODAL DE SELECCIÓN DE ACTIVOS */}
            <SelectModal<SolicitudActivoInfo>
                visible={modalActivoVisible}
                title="Seleccionar Activo / Equipo"
                items={activos}
                selectedId={selectedActivoId}
                searchPlaceholder="Buscar equipo por nombre o código..."
                onClose={() => setModalActivoVisible(false)}
                onSelect={(item) => {
                    setValue("activoId", item.id, { shouldValidate: true });
                    setModalActivoVisible(false);
                }}
                getSearchableText={(item) => `${item.codigo} ${item.nombre}`}
                renderItemContent={(item, isSelected) => (
                    <View className="flex-1">
                        <Text
                            className={`text-xs font-bold ${
                                isSelected ? "text-blue-700" : "text-slate-500"
                            }`}
                        >
                            {item.codigo}
                        </Text>
                        <Text
                            className={`text-sm font-semibold mt-0.5 ${
                                isSelected ? "text-blue-950" : "text-slate-900"
                            }`}
                        >
                            {item.nombre}
                        </Text>
                    </View>
                )}
            />

            {/* MODAL DE SELECCIÓN DE SOLICITANTES */}
            <SelectModal<SolicitudEmpleadoInfo>
                visible={modalEmpleadoVisible}
                title="Seleccionar Solicitante"
                items={empleados}
                selectedId={selectedSolicitanteId}
                searchPlaceholder="Buscar por nombre o cargo..."
                onClose={() => setModalEmpleadoVisible(false)}
                onSelect={(item) => {
                    setValue("solicitanteId", item.id, { shouldValidate: true });
                    setModalEmpleadoVisible(false);
                }}
                getSearchableText={(item) =>
                    `${item.nombreCompleto || item.nombre} ${item.cargo || ""} ${item.codigo || ""}`
                }
                renderItemContent={(item, isSelected) => (
                    <View className="flex-1">
                        <Text
                            className={`text-sm font-bold ${
                                isSelected ? "text-blue-950" : "text-slate-900"
                            }`}
                        >
                            {item.nombreCompleto || item.nombre}
                        </Text>
                        {item.cargo && (
                            <Text
                                className={`text-xs mt-0.5 ${
                                    isSelected ? "text-blue-700" : "text-slate-500"
                                }`}
                            >
                                {item.cargo}
                            </Text>
                        )}
                    </View>
                )}
            />

            {/* Modal de Éxito */}
            <AlertDialog
                isOpen={successDialogOpen}
                onClose={() => {
                    setSuccessDialogOpen(false);
                    router.back();
                }}
                size="md"
            >
                <AlertDialogBackdrop />
                <AlertDialogContent className="rounded-3xl bg-white p-5 max-w-[340px] shadow-2xl border border-slate-100">
                    <AlertDialogHeader className="pb-2">
                        <View className="flex-row items-center gap-2.5">
                            <View className="h-9 w-9 rounded-2xl bg-emerald-50 items-center justify-center border border-emerald-100">
                                <CheckIcon size={18} color="#059669" />
                            </View>
                            <Text className="text-base font-bold text-slate-900">
                                {dialogTitle}
                            </Text>
                        </View>
                    </AlertDialogHeader>

                    <AlertDialogBody className="py-2">
                        <Text className="text-xs text-slate-600 leading-relaxed">
                            {dialogDesc}
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter className="pt-4 flex-row justify-end">
                        <Button
                            variant="solid"
                            action="primary"
                            size="sm"
                            onPress={() => {
                                setSuccessDialogOpen(false);
                                router.back();
                            }}
                            className="rounded-xl bg-blue-600 active:bg-blue-700"
                        >
                            <ButtonText className="text-xs font-bold text-white">
                                Aceptar
                            </ButtonText>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </KeyboardAvoidingView>
    );
}
