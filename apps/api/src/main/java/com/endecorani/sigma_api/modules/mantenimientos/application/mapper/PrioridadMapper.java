package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.request.PrioridadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.request.PrioridadUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.response.PrioridadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
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
public interface PrioridadMapper {

    @Mapping(target = "id", ignore = true)
    Prioridad toDomain(PrioridadRequest dto);

    @Mapping(target = "auditoria", source = ".")
    PrioridadResponse toResponse(Prioridad domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(PrioridadUpdate dto, @MappingTarget Prioridad domain);
}