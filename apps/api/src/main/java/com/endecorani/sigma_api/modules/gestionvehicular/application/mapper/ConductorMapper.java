package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ConductorMapper {

    @Mapping(target = "id", ignore = true)
    Conductor toDomain(ConductorRequest dto);

    @Mapping(target = "auditoria", source = ".")
    ConductorResponse toResponse(Conductor domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(ConductorUpdate dto, @MappingTarget Conductor domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(ConductorRequest dto, @MappingTarget Conductor domain);
}
