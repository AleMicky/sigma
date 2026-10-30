package com.endecorani.sigma_api.modules.incidentes.application.mapper;

import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request.IncidenteInvolucradoRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request.IncidenteInvolucradoUpdate;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.response.IncidenteInvolucradoResponse;
import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteInvolucrado;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface IncidenteInvolucradoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "incidenteActivoId", ignore = true)
    IncidenteInvolucrado toDomain(IncidenteInvolucradoRequest request);

    @Mapping(target = "auditoria", source = "domain")
    IncidenteInvolucradoResponse toResponse(IncidenteInvolucrado domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "incidenteActivoId", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateDomain(IncidenteInvolucradoUpdate request, @MappingTarget IncidenteInvolucrado domain);
}

