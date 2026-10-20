package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActividadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActividadUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoActividadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
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
public interface PlanMantenimientoActividadMapper {

    @Mapping(target = "id", ignore = true)
    PlanMantenimientoActividad toDomain(PlanMantenimientoActividadRequest dto);

    @Mapping(target = "auditoria", source = ".")
    @Mapping(target = "actividad", ignore = true)
    @Mapping(target = "tipoActivo", ignore = true)
    @Mapping(target = "componente", ignore = true)
    PlanMantenimientoActividadResponse toResponse(PlanMantenimientoActividad domain);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "planMantenimientoId", source = "domain.planMantenimientoId")
    @Mapping(target = "actividadMantenimientoAplicacionId", source = "domain.actividadMantenimientoAplicacionId")
    @Mapping(target = "orden", source = "domain.orden")
    @Mapping(target = "obligatorio", source = "domain.obligatorio")
    @Mapping(target = "actividad", source = "actividad")
    @Mapping(target = "tipoActivo", source = "tipoActivo")
    @Mapping(target = "componente", source = "componente")
    PlanMantenimientoActividadResponse toResponse(
            PlanMantenimientoActividad domain,
            PlanMantenimientoActividadResponse.ActividadInfo actividad,
            PlanMantenimientoActividadResponse.TipoActivoInfo tipoActivo,
            PlanMantenimientoActividadResponse.ComponenteInfo componente
    );

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "planMantenimientoId", ignore = true)
    @Mapping(target = "actividadMantenimientoAplicacionId", ignore = true)
    void updateDomain(PlanMantenimientoActividadUpdate dto, @MappingTarget PlanMantenimientoActividad domain);
}
