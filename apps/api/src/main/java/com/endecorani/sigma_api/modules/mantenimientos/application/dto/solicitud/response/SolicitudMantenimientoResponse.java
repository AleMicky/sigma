package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SolicitudMantenimientoResponse(
                UUID id,
                String numero,
                ActivoInfo activo,
                TipoMantenimientoInfo tipoMantenimiento,
                String tipoFallas,
                PrioridadInfo prioridad,
                EmpleadoInfo solicitante,
                String titulo,
                String descripcion,
                LocalDateTime fechaSolicitud,
                EmpleadoInfo aprobador,
                EmpleadoInfo responsable,
                EmpleadoInfo supervisor,
                LocalDateTime fechaInicioMantenimiento,
                LocalDateTime fechaFinMantenimiento,
                LocalDateTime fechaCierre,
                String processInstanceId,
                String estado,
                List<SolicitudMantenimientoAdjuntoResponse> adjuntos,
                AuditoriaResponse auditoria) {
        public record ActivoInfo(
                        UUID id,
                        String codigo,
                        String nombre) {
        }

        public record TipoMantenimientoInfo(
                        UUID id,
                        String codigo,
                        String nombre) {
        }

        public record PrioridadInfo(
                        UUID id,
                        String codigo,
                        String nombre,
                        Integer nivel) {
        }

        public record EmpleadoInfo(
                        UUID id,
                        String nombreCompleto,
                        String cargo) {
        }
}
