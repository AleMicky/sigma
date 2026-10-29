package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ItemTiempoRecorridoResponse(
        UUID salidaId,
        String numero,
        String placa,
        String vehiculoDescripcion,
        String empleadoNombre,
        String descripcionActividad,
        String observaciones,
        String estado,
        Instant fechaInicio,
        Instant fechaFin,
        Long duracionMinutos,
        Double duracionHoras
) {
}
