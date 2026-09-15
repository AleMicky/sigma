package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.response.TipoMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
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
public interface TipoMantenimientoMapper {

    @Mapping(target = "id", ignore = true)
    TipoMantenimiento toDomain(TipoMantenimientoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    TipoMantenimientoResponse toResponse(TipoMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(TipoMantenimientoUpdate dto, @MappingTarget TipoMantenimiento domain);
}