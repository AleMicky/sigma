package com.endecorani.sigma_api.modules.incidentes.application.mapper;

import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.IncidenteActivoRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.IncidenteActivoUpdate;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.response.IncidenteActivoResponse;
import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteActivo;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        uses = {AuditoriaResponseMapper.class, IncidenteInvolucradoMapper.class, IncidenteEvidenciaMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface IncidenteActivoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "processInstanceId", ignore = true)
    @Mapping(target = "involucrados", ignore = true)
    @Mapping(target = "evidencias", ignore = true)
    IncidenteActivo toDomain(IncidenteActivoRequest request);

    @Mapping(target = "auditoria", source = "domain")
    IncidenteActivoResponse toResponse(IncidenteActivo domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "processInstanceId", ignore = true)
    @Mapping(target = "involucrados", ignore = true)
    @Mapping(target = "evidencias", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateDomain(IncidenteActivoUpdate request, @MappingTarget IncidenteActivo domain);
}

