package com.endecorani.sigma_api.modules.incidentes.application.mapper;

import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteevidencia.response.IncidenteEvidenciaResponse;
import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteEvidencia;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface IncidenteEvidenciaMapper {

    @Mapping(target = "auditoria", source = "domain")
    IncidenteEvidenciaResponse toResponse(IncidenteEvidencia domain);
}

