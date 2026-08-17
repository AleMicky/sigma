package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "SolicitudMantenimientoResponse",
        description = "Información de una solicitud de mantenimiento"
)
public record SolicitudMantenimientoResponse(
        @Schema(description = "Identificador único")
        UUID id,

        @Schema(description = "Número de la solicitud", example = "SOL-2026-001")
        String numero,

        @Schema(description = "Información del activo")
        ActivoInfo activo,

        @Schema(description = "Información del tipo de mantenimiento")
        TipoMantenimientoInfo tipoMantenimiento,

        @Schema(description = "Motivo de mantenimiento")
        UUID motivoMantenimientoId,

        @Schema(description = "Información de la prioridad")
        PrioridadInfo prioridad,

        @Schema(description = "Información del solicitante")
        UserInfo solicitante,

        @Schema(description = "Información del área solicitante")
        AreaInfo areaSolicitante,

        @Schema(description = "Título de la solicitud", example = "Falla en motor principal")
        String titulo,

        @Schema(description = "Descripción de la solicitud")
        String descripcion,

        @Schema(description = "Fecha de la solicitud")
        LocalDateTime fechaSolicitud,

        @Schema(description = "Información de quien aprobó")
        UserInfo aprobadoPor,

        @Schema(description = "Fecha de aprobación")
        LocalDateTime fechaAprobacion,

        @Schema(description = "Observación de aprobación")
        String observacionAprobacion,

        @Schema(description = "Información del responsable")
        UserInfo responsable,

        @Schema(description = "Fecha de asignación")
        LocalDateTime fechaAsignacion,

        @Schema(description = "Fecha de inicio del mantenimiento")
        LocalDateTime fechaInicioMantenimiento,

        @Schema(description = "Fecha de fin del mantenimiento")
        LocalDateTime fechaFinMantenimiento,

        @Schema(description = "Información del supervisor")
        UserInfo supervisor,

        @Schema(description = "Fecha de validación")
        LocalDateTime fechaValidacion,

        @Schema(description = "Observación de validación")
        String observacionValidacion,

        @Schema(description = "Fecha de finalización")
        LocalDateTime fechaFinalizacion,

        @Schema(description = "Información de quien recibió")
        UserInfo recibidoPor,

        @Schema(description = "Observación de cierre")
        String observacionCierre,

        @Schema(description = "Estado de la solicitud", example = "PENDIENTE")
        String estado,

        @Schema(description = "ID de instancia del proceso")
        String processInstanceId,

        @Schema(description = "Datos de auditoría")
        AuditoriaResponse auditoria
) {
    public record ActivoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record TipoMantenimientoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record PrioridadInfo(
            UUID id,
            String codigo,
            String nombre,
            Integer nivel
    ) {
    }

    public record UserInfo(
            UUID id,
            String nombre
    ) {
    }

    public record AreaInfo(
            UUID id,
            String nombre
    ) {
    }
}
