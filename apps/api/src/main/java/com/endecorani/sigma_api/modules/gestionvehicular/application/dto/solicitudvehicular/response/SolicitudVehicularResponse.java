package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SolicitudVehicularResponse(
        UUID id,
        String numero,
        UUID tipoSolicitudVehicularId,
        SolicitudVehicularTipoSolicitudInfo tipoSolicitudVehicular,
        UUID solicitanteId,
        SolicitudVehicularSolicitanteInfo solicitante,
        String motivo,
        String justificacion,
        String destino,
        LocalDateTime fechaSalida,
        LocalDateTime fechaRetornoEstimada,
        Integer cantidadPasajeros,
        String observacion,
        String estado,
        String processInstanceId,
        List<SolicitudVehicularAdjuntoResponse> adjuntos,
        AuditoriaResponse auditoria
) {
}
