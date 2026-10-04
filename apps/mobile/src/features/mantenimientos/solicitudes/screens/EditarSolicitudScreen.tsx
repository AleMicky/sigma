import React, { useMemo } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SolicitudForm } from "../components/SolicitudForm";
import {
    useSolicitudDetailQuery,
    useUpdateSolicitudMutation,
} from "../hooks/use-solicitudes";
import { CreateSolicitudFormValues } from "../schemas/solicitud.schema";

export function EditarSolicitudScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const {
        data: solicitud,
        isLoading: loadingSolicitud,
        isError: errorSolicitud,
    } = useSolicitudDetailQuery(id as string);

    const updateMutation = useUpdateSolicitudMutation();

    const initialValues: Partial<CreateSolicitudFormValues> | undefined = useMemo(() => {
        if (!solicitud) return undefined;
        return {
            titulo: solicitud.titulo || "",
            descripcion: solicitud.descripcion || "",
            tipoFallas: solicitud.tipoFallas || "",
            activoId: solicitud.activo?.id || "",
            tipoMantenimientoId: solicitud.tipoMantenimiento?.id || "",
            prioridadId: solicitud.prioridad?.id || "",
            solicitanteId: solicitud.solicitante?.id || "",
            fechaSolicitud: solicitud.fechaSolicitud || new Date().toISOString(),
        };
    }, [solicitud]);

    const handleSubmit = async (values: CreateSolicitudFormValues) => {
        if (!id) return;
        await updateMutation.mutateAsync({
            id,
            payload: {
                titulo: values.titulo.trim(),
                descripcion: values.descripcion.trim(),
                tipoFallas: values.tipoFallas?.trim() || null,
                activoId: values.activoId,
                tipoMantenimientoId: values.tipoMantenimientoId,
                prioridadId: values.prioridadId,
                solicitanteId: values.solicitanteId,
                fechaSolicitud: values.fechaSolicitud || null,
            },
        });
    };

    if (loadingSolicitud) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-3 text-xs font-semibold text-slate-500">
                    Cargando solicitud para editar...
                </Text>
            </View>
        );
    }

    if (errorSolicitud || !solicitud) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 px-6">
                <Text className="text-base font-bold text-slate-800">
                    No se encontró la solicitud
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5"
                >
                    <Text className="text-xs font-bold text-white">Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SolicitudForm
            mode="edit"
            title={`Editar ${solicitud.numero || "Solicitud"}`}
            subtitle="Modificar requerimiento"
            submitButtonLabel="Guardar Cambios"
            successDialogTitle="Solicitud Actualizada"
            successDialogDescription="Los cambios de la solicitud de mantenimiento se han guardado exitosamente."
            initialValues={initialValues}
            initialActivo={solicitud.activo}
            initialSolicitante={solicitud.solicitante}
            onSubmit={handleSubmit}
            isLoadingSubmission={updateMutation.isPending}
        />
    );
}
