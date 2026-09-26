package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudVehicularResponse(
        UUID id,
        String numero,
        UUID tipoSolicitudVehicularId,
        TipoSolicitudVehicularInfo tipoSolicitudVehicular,
        UUID solicitanteId,
        SolicitanteInfo solicitante,
        String motivo,
        String justificacion,
        String destino,
        LocalDateTime fechaSalida,
        LocalDateTime fechaRetornoEstimada,
        Integer cantidadPasajeros,
        String observacion,
        String estado,
        String processInstanceId,
        AuditoriaResponse auditoria
) {
    public record TipoSolicitudVehicularInfo(
            UUID id,
            String codigo,
            String nombre,
            Integer diasAnticipacion,
            Boolean requiereRespaldo,
            Boolean requiereJustificacion
    ) {}

    public record SolicitanteInfo(
            UUID id,
            String codigo,
            String nombreCompleto,
            String cargo,
            String area
    ) {}
}
