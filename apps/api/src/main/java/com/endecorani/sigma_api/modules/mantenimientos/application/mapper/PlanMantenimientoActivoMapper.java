package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActivoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
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
public interface PlanMantenimientoActivoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", expression = "java(dto.activo())")
    PlanMantenimientoActivo toDomain(PlanMantenimientoActivoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    @Mapping(target = "estadoActivo", source = "activo")
    @Mapping(target = "plan", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "responsable", ignore = true)
    PlanMantenimientoActivoResponse toResponse(PlanMantenimientoActivo domain);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "planMantenimientoId", source = "domain.planMantenimientoId")
    @Mapping(target = "activoId", source = "domain.activoId")
    @Mapping(target = "responsableId", source = "domain.responsableId")
    @Mapping(target = "fechaInicio", source = "domain.fechaInicio")
    @Mapping(target = "fechaFin", source = "domain.fechaFin")
    @Mapping(target = "estadoActivo", source = "domain.activo")
    @Mapping(target = "plan", source = "plan")
    @Mapping(target = "activo", source = "activo")
    @Mapping(target = "responsable", source = "responsable")
    PlanMantenimientoActivoResponse toResponse(
            PlanMantenimientoActivo domain,
            PlanMantenimientoActivoResponse.PlanInfo plan,
            PlanMantenimientoActivoResponse.ActivoInfo activo,
            PlanMantenimientoActivoResponse.ResponsableInfo responsable
    );

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "planMantenimientoId", ignore = true)
    @Mapping(target = "activoId", ignore = true)
    @Mapping(target = "activo", source = "dto.estadoActivo")
    void updateDomain(PlanMantenimientoActivoUpdate dto, @MappingTarget PlanMantenimientoActivo domain);
}
