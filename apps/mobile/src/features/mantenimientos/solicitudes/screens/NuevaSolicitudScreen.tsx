import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    BoxesIcon,
    CalendarIcon,
    CheckCircleIcon,
    CheckIcon,
    ChevronRightIcon,
    CloseIcon,
    SearchIcon,
    UserIcon,
    WrenchIcon,
} from "@/src/components/icons";
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
    const [searchActivo, setSearchActivo] = useState("");
    const [searchEmpleado, setSearchEmpleado] = useState("");

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

    const filteredActivos = activos.filter((a) => {
        const query = searchActivo.toLowerCase().trim();
        if (!query) return true;
        return (
            a.nombre.toLowerCase().includes(query) ||
            a.codigo.toLowerCase().includes(query)
        );
    });

    const filteredEmpleados = empleados.filter((e) => {
        const query = searchEmpleado.toLowerCase().trim();
        if (!query) return true;
        const nombre = (e.nombreCompleto || e.nombre || "").toLowerCase();
        const cargo = (e.cargo || "").toLowerCase();
        const codigo = (e.codigo || "").toLowerCase();
        return nombre.includes(query) || cargo.includes(query) || codigo.includes(query);
    });

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
            {/* Native Mobile Header */}
            <View
                style={{ paddingTop: Math.max(insets.top, 12) }}
                className="bg-white px-4 pb-3 border-b border-slate-200/80 shadow-sm flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-2.5">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.back()}
                        className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
                        accessibilityLabel="Regresar"
                    >
                        <ArrowLeftIcon size={18} color="#0f172a" />
                    </TouchableOpacity>

                    <View>
                        <Text className="text-lg font-extrabold text-slate-900 tracking-tight">
                            Nueva Solicitud
                        </Text>
                        <Text className="text-[11px] font-medium text-slate-400">
                            Mantenimiento
                        </Text>
                    </View>
                </View>

                {/* Quick Save Top Button */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                    activeOpacity={0.7}
                    className="rounded-full bg-blue-50 px-3.5 py-1.5 border border-blue-200 active:bg-blue-100"
                >
                    {isPending ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text className="text-xs font-bold text-blue-700">
                            Guardar
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

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
                    <View className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 flex-row items-start gap-2.5 shadow-sm">
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

                {/* ============================================================ */}
                {/* GRUPO 1: REQUERIMIENTO PRINCIPAL                             */}
                {/* ============================================================ */}
                <View className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
                    <View className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                        <Text className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            Detalle del Problema
                        </Text>
                    </View>

                    <View className="p-4 gap-3.5">
                        {/* Título */}
                        <Controller
                            control={control}
                            name="titulo"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View>
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-xs font-bold text-slate-700">
                                            Título del Requerimiento *
                                        </Text>
                                        <Text className="text-[10px] text-slate-400 font-medium">
                                            {(value || "").length}/150
                                        </Text>
                                    </View>
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        maxLength={150}
                                        placeholder="Ej. Fuga de aceite en turbina principal"
                                        placeholderTextColor="#94a3b8"
                                        className={`rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 ${
                                            errors.titulo
                                                ? "border-rose-400 bg-rose-50/40"
                                                : "border-slate-200 focus:border-blue-500 focus:bg-white"
                                        }`}
                                    />
                                    {errors.titulo && (
                                        <View className="flex-row items-center gap-1.5 mt-1">
                                            <AlertCircleIcon size={12} color="#e11d48" />
                                            <Text className="text-[11px] font-medium text-rose-600">
                                                {errors.titulo.message}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        />

                        {/* Descripción */}
                        <Controller
                            control={control}
                            name="descripcion"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View>
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-xs font-bold text-slate-700">
                                            Descripción Técnica *
                                        </Text>
                                        <Text className="text-[10px] text-slate-400 font-medium">
                                            {(value || "").length}/2000
                                        </Text>
                                    </View>
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        maxLength={2000}
                                        placeholder="Describe el síntoma, impacto operacional o requerimiento técnico..."
                                        placeholderTextColor="#94a3b8"
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                        className={`rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 min-h-[85px] ${
                                            errors.descripcion
                                                ? "border-rose-400 bg-rose-50/40"
                                                : "border-slate-200 focus:border-blue-500 focus:bg-white"
                                        }`}
                                    />
                                    {errors.descripcion && (
                                        <View className="flex-row items-center gap-1.5 mt-1">
                                            <AlertCircleIcon size={12} color="#e11d48" />
                                            <Text className="text-[11px] font-medium text-rose-600">
                                                {errors.descripcion.message}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    </View>
                </View>

                {/* ============================================================ */}
                {/* GRUPO 2: EQUIPO Y CLASIFICACIÓN (Form Rows)                 */}
                {/* ============================================================ */}
                <View className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
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

                    {/* Fila 2: Tipo de Mantenimiento (Segmented Pills) */}
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
                                            className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5 border shadow-sm ${
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

                    {/* Fila 3: Nivel de Prioridad (Color Segmented) */}
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
                                            className={`flex-1 items-center justify-center rounded-xl py-2 border ${
                                                isSelected
                                                    ? isUrgente
                                                        ? "bg-rose-600 border-rose-600 shadow-sm"
                                                        : isAlta
                                                        ? "bg-amber-500 border-amber-500 shadow-sm"
                                                        : "bg-blue-600 border-blue-600 shadow-sm"
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

                {/* ============================================================ */}
                {/* GRUPO 3: SOLICITANTE Y DETALLES ADICIONALES                 */}
                {/* ============================================================ */}
                <View className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
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
                                <View>
                                    <Text className="text-xs font-bold text-slate-700 mb-1">
                                        Falla o Síntoma Detectado (Opcional)
                                    </Text>
                                    <TextInput
                                        value={value ?? ""}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        maxLength={200}
                                        placeholder="Ej. Sobrecalentamiento, ruido anormal, vibración"
                                        placeholderTextColor="#94a3b8"
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:bg-white"
                                    />
                                </View>
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

            {/* Bottom Floating Bar */}
            <View
                style={{ paddingBottom: Math.max(insets.bottom, 12) + 6 }}
                className="bg-white/95 px-5 pt-3 border-t border-slate-200/80 shadow-lg"
            >
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                    className={`h-12 flex-row items-center justify-center rounded-2xl bg-blue-600 shadow-md active:bg-blue-700 ${
                        isPending ? "opacity-70" : ""
                    }`}
                >
                    {isPending ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text className="text-base font-bold text-white tracking-wide">
                            Registrar Solicitud
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ============================================================ */}
            {/* BOTTOM SHEET: Selector de Activos                           */}
            {/* ============================================================ */}
            <Modal
                visible={modalActivoVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalActivoVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View
                        style={{ maxHeight: "85%", paddingBottom: Math.max(insets.bottom, 16) }}
                        className="rounded-t-3xl bg-white p-5 shadow-2xl"
                    >
                        {/* Drag Handle Bar */}
                        <View className="items-center pb-3">
                            <View className="h-1 w-10 rounded-full bg-slate-300" />
                        </View>

                        {/* Title & Close */}
                        <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                            <View className="flex-row items-center gap-2">
                                <BoxesIcon size={18} color="#ea580c" />
                                <Text className="text-base font-extrabold text-slate-900">
                                    Seleccionar Equipo / Activo
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalActivoVisible(false)}
                                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                            >
                                <CloseIcon size={14} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View className="my-3 flex-row items-center rounded-2xl bg-slate-100 px-3.5 h-10 border border-slate-200">
                            <SearchIcon size={16} color="#94a3b8" />
                            <TextInput
                                value={searchActivo}
                                onChangeText={setSearchActivo}
                                placeholder="Buscar por código o nombre..."
                                placeholderTextColor="#94a3b8"
                                className="flex-1 ml-2 text-xs font-medium text-slate-900"
                                autoFocus
                            />
                            {searchActivo.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchActivo("")}>
                                    <CloseIcon size={12} color="#94a3b8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {loadingActivos ? (
                            <View className="py-12 items-center">
                                <ActivityIndicator size="small" color="#2563eb" />
                                <Text className="text-xs text-slate-400 mt-2">
                                    Cargando equipos...
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredActivos}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    const isSelected = item.id === selectedActivoId;
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setValue("activoId", item.id, {
                                                    shouldValidate: true,
                                                });
                                                setModalActivoVisible(false);
                                            }}
                                            className={`flex-row items-center justify-between p-3.5 border-b border-slate-100 rounded-xl ${
                                                isSelected ? "bg-orange-50/70" : "active:bg-slate-50"
                                            }`}
                                        >
                                            <View className="flex-1 mr-2">
                                                <Text className="text-sm font-bold text-slate-800">
                                                    {item.nombre}
                                                </Text>
                                                <Text className="text-xs text-orange-600 font-semibold mt-0.5">
                                                    Cód: {item.codigo}
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <CheckCircleIcon size={18} color="#ea580c" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    <View className="py-8 items-center">
                                        <Text className="text-xs text-slate-400">
                                            No se encontraron equipos coincidentes.
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* ============================================================ */}
            {/* BOTTOM SHEET: Selector de Solicitante                       */}
            {/* ============================================================ */}
            <Modal
                visible={modalEmpleadoVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalEmpleadoVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/60">
                    <View
                        style={{ maxHeight: "85%", paddingBottom: Math.max(insets.bottom, 16) }}
                        className="rounded-t-3xl bg-white p-5 shadow-2xl"
                    >
                        {/* Drag Handle Bar */}
                        <View className="items-center pb-3">
                            <View className="h-1 w-10 rounded-full bg-slate-300" />
                        </View>

                        {/* Title & Close */}
                        <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                            <View className="flex-row items-center gap-2">
                                <UserIcon size={18} color="#2563eb" />
                                <Text className="text-base font-extrabold text-slate-900">
                                    Seleccionar Solicitante
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setModalEmpleadoVisible(false)}
                                className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                            >
                                <CloseIcon size={14} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input */}
                        <View className="my-3 flex-row items-center rounded-2xl bg-slate-100 px-3.5 h-10 border border-slate-200">
                            <SearchIcon size={16} color="#94a3b8" />
                            <TextInput
                                value={searchEmpleado}
                                onChangeText={setSearchEmpleado}
                                placeholder="Buscar por nombre o cargo..."
                                placeholderTextColor="#94a3b8"
                                className="flex-1 ml-2 text-xs font-medium text-slate-900"
                                autoFocus
                            />
                            {searchEmpleado.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchEmpleado("")}>
                                    <CloseIcon size={12} color="#94a3b8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {loadingEmpleados ? (
                            <View className="py-12 items-center">
                                <ActivityIndicator size="small" color="#2563eb" />
                                <Text className="text-xs text-slate-400 mt-2">
                                    Cargando personal...
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredEmpleados}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    const isSelected = item.id === selectedSolicitanteId;
                                    const nombre = item.nombreCompleto || item.nombre || `Empleado ${item.codigo || item.id.substring(0, 6)}`;
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setValue("solicitanteId", item.id, {
                                                    shouldValidate: true,
                                                });
                                                setModalEmpleadoVisible(false);
                                            }}
                                            className={`flex-row items-center justify-between p-3.5 border-b border-slate-100 rounded-xl ${
                                                isSelected ? "bg-blue-50/70" : "active:bg-slate-50"
                                            }`}
                                        >
                                            <View className="flex-1 mr-2">
                                                <Text className="text-sm font-bold text-slate-800">
                                                    {nombre}
                                                </Text>
                                                {item.cargo && (
                                                    <Text className="text-xs text-slate-400 mt-0.5">
                                                        {item.cargo}
                                                    </Text>
                                                )}
                                            </View>
                                            {isSelected && (
                                                <CheckCircleIcon size={18} color="#2563eb" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    <View className="py-8 items-center">
                                        <Text className="text-xs text-slate-400">
                                            No se encontró personal disponible.
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
