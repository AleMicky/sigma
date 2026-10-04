import React from "react";
import { SolicitudForm } from "../components/SolicitudForm";
import { useCreateSolicitudMutation } from "../hooks/use-solicitudes";
import { CreateSolicitudFormValues } from "../schemas/solicitud.schema";

export function NuevaSolicitudScreen() {
    const createMutation = useCreateSolicitudMutation();

    const handleSubmit = async (values: CreateSolicitudFormValues) => {
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
    };

    return (
        <SolicitudForm
            mode="create"
            title="Nueva Solicitud"
            subtitle="Mantenimiento"
            submitButtonLabel="Crear Solicitud"
            successDialogTitle="Solicitud Registrada"
            successDialogDescription="La solicitud de mantenimiento ha sido registrada exitosamente."
            onSubmit={handleSubmit}
            isLoadingSubmission={createMutation.isPending}
        />
    );
}
