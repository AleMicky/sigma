package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
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
public interface PlanMantenimientoMapper {

    @Mapping(target = "id", ignore = true)
    PlanMantenimiento toDomain(PlanMantenimientoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    @Mapping(target = "tipoActivoNombre", ignore = true)
    PlanMantenimientoResponse toResponse(PlanMantenimiento domain);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "codigo", source = "domain.codigo")
    @Mapping(target = "nombre", source = "domain.nombre")
    @Mapping(target = "descripcion", source = "domain.descripcion")
    @Mapping(target = "tipoActivoId", source = "domain.tipoActivoId")
    @Mapping(target = "tipoActivoNombre", source = "tipoActivoNombre")
    PlanMantenimientoResponse toResponse(PlanMantenimiento domain, String tipoActivoNombre);

    @Mapping(target = "id", ignore = true)
    void updateDomain(PlanMantenimientoUpdate dto, @MappingTarget PlanMantenimiento domain);
}
