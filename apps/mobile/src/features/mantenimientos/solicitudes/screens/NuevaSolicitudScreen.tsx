import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    ChevronRightIcon,
    UserIcon,
    WrenchIcon,
} from "@/src/components/icons";
import {
    FormField,
    ScreenHeader,
    SelectModal,
} from "@/src/components/common";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";
import {
    useActivosQuery,
    useCreateSolicitudMutation,
    useEmpleadosQuery,
    usePrioridadesQuery,
    useTiposMantenimientoQuery,
} from "../hooks/use-solicitudes";
import {
    CreateSolicitudFormValues,
    createSolicitudSchema,
    defaultCreateSolicitudValues,
} from "../schemas/solicitud.schema";
import { SolicitudActivoInfo, SolicitudEmpleadoInfo } from "../types/solicitud.types";

export function NuevaSolicitudScreen() {
    const insets = useSafeAreaInsets();
    const [formError, setFormError] = useState<string | null>(null);

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

    const createMutation = useCreateSolicitudMutation();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CreateSolicitudFormValues>({
        resolver: zodResolver(createSolicitudSchema),
        defaultValues: defaultCreateSolicitudValues,
        mode: "onTouched",
    });

    const selectedActivoId = watch("activoId");
    const selectedTipoId = watch("tipoMantenimientoId");
    const selectedPrioridadId = watch("prioridadId");
    const selectedSolicitanteId = watch("solicitanteId");

    // Autoseleccionar primer tipo de mantenimiento si no está seleccionado
    useEffect(() => {
        if (tiposMantenimiento.length > 0 && !selectedTipoId) {
            setValue("tipoMantenimientoId", tiposMantenimiento[0].id, { shouldValidate: true });
        }
    }, [tiposMantenimiento, selectedTipoId, setValue]);

    // Autoseleccionar prioridad por defecto
    useEffect(() => {
        if (prioridades.length > 0 && !selectedPrioridadId) {
            setValue("prioridadId", prioridades[0].id, { shouldValidate: true });
        }
    }, [prioridades, selectedPrioridadId, setValue]);

    // Autoseleccionar primer empleado como solicitante
    useEffect(() => {
        if (empleados.length > 0 && !selectedSolicitanteId) {
            setValue("solicitanteId", empleados[0].id, { shouldValidate: true });
        }
    }, [empleados, selectedSolicitanteId, setValue]);

    const selectedActivo = activos.find((a) => a.id === selectedActivoId);
    const selectedEmpleado = empleados.find((e) => e.id === selectedSolicitanteId);

    const onSubmit = async (values: CreateSolicitudFormValues) => {
        setFormError(null);
        try {
            await createMutation.mutateAsync({
                titulo: values.titulo.trim(),
                descripcion: values.descripcion.trim(),
                tipoFallas: values.tipoFallas?.trim() || null,
                activoId: values.activoId,
                tipoMantenimientoId: values.tipoMantenimientoId,
                prioridadId: values.prioridadId,
                solicitanteId: values.solicitanteId,
                fechaSolicitud: values.fechaSolicitud || null,
            });

            Alert.alert(
                "Solicitud Creada",
                "La solicitud de mantenimiento ha sido registrada exitosamente.",
                [
                    {
                        text: "Aceptar",
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo registrar la solicitud de mantenimiento. Por favor revisa los campos.";
            setFormError(msg);
            Alert.alert("Error al registrar", msg);
        }
    };

    const isPending = isSubmitting || createMutation.isPending;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-slate-100"
        >
            {/* Standard Screen Header */}
            <ScreenHeader
                title="Nueva Solicitud"
                subtitle="Mantenimiento"
                rightAction={{
                    label: "Guardar",
                    onPress: handleSubmit(onSubmit),
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
                                        ? `${selectedActivo.codigo} • ${selectedActivo.nombre}`
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

                    {/* Fecha de Registro */}
                    <View className="p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <CalendarIcon size={15} color="#64748b" />
                            <Text className="text-xs font-medium text-slate-600">
                                Fecha de Registro:
                            </Text>
                        </View>
                        <Text className="text-xs font-bold text-slate-800">
                            {new Date().toLocaleDateString("es-BO", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Floating Action Bar using Gluestack Button */}
            <View
                style={{ paddingBottom: Math.max(insets.bottom, 12) + 6 }}
                className="bg-white/95 px-5 pt-3 border-t border-slate-200/80 shadow-lg"
            >
                <Button
                    size="lg"
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                    className="h-12 rounded-2xl bg-blue-600 active:bg-blue-700 shadow-md"
                >
                    {isPending ? (
                        <ButtonSpinner color="#ffffff" />
                    ) : (
                        <ButtonText className="text-base font-bold text-white tracking-wide">
                            Registrar Solicitud
                        </ButtonText>
                    )}
                </Button>
            </View>

            {/* Reusable SelectModal for Activos */}
            <SelectModal<SolicitudActivoInfo>
                visible={modalActivoVisible}
                onClose={() => setModalActivoVisible(false)}
                title="Seleccionar Equipo / Activo"
                icon={<BoxesIcon size={18} color="#ea580c" />}
                items={activos}
                selectedId={selectedActivoId}
                isLoading={loadingActivos}
                searchPlaceholder="Buscar por código o nombre..."
                getItemTitle={(item) => item.nombre}
                getItemSubtitle={(item) => `Cód: ${item.codigo}`}
                onSelect={(item) => {
                    setValue("activoId", item.id, { shouldValidate: true });
                }}
            />

            {/* Reusable SelectModal for Solicitantes */}
            <SelectModal<SolicitudEmpleadoInfo>
                visible={modalEmpleadoVisible}
                onClose={() => setModalEmpleadoVisible(false)}
                title="Seleccionar Solicitante"
                icon={<UserIcon size={18} color="#2563eb" />}
                items={empleados}
                selectedId={selectedSolicitanteId}
                isLoading={loadingEmpleados}
                searchPlaceholder="Buscar por nombre o cargo..."
                getItemTitle={(item) =>
                    item.nombreCompleto || item.nombre || `Empleado ${item.codigo || item.id.substring(0, 6)}`
                }
                getItemSubtitle={(item) => item.cargo ?? undefined}
                onSelect={(item) => {
                    setValue("solicitanteId", item.id, { shouldValidate: true });
                }}
            />
        </KeyboardAvoidingView>
    );
}
