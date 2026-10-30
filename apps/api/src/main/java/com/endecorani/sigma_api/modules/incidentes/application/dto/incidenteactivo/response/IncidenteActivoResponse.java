package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.response;

import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteevidencia.response.IncidenteEvidenciaResponse;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.response.IncidenteInvolucradoResponse;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record IncidenteActivoResponse(
        UUID id,
        UUID activoId,
        String tipoIncidente,
        String prioridad,
        String estado,
        LocalDateTime fechaHora,
        String ubicacion,
        BigDecimal latitud,
        BigDecimal longitud,
        String descripcion,
        UUID empleadoReportaId,
        String processInstanceId,
        List<IncidenteInvolucradoResponse> involucrados,
        List<IncidenteEvidenciaResponse> evidencias,
        AuditoriaResponse auditoria
) {
}

