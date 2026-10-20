package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoCriterioResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {AuditoriaResponseMapper.class, ProgramacionMantenimientoCriterioMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ProgramacionMantenimientoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", expression = "java(dto.activo())")
    @Mapping(target = "criterios", ignore = true)
    ProgramacionMantenimiento toDomain(ProgramacionMantenimientoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    @Mapping(target = "planActivo", ignore = true)
    ProgramacionMantenimientoResponse toResponse(ProgramacionMantenimiento domain);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "planMantenimientoActivoId", source = "domain.planMantenimientoActivoId")
    @Mapping(target = "activo", source = "domain.activo")
    @Mapping(target = "planActivo", source = "planActivo")
    @Mapping(target = "criterios", source = "criterios")
    ProgramacionMantenimientoResponse toResponse(
            ProgramacionMantenimiento domain,
            ProgramacionMantenimientoResponse.PlanActivoInfo planActivo,
            List<ProgramacionMantenimientoCriterioResponse> criterios
    );

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "planMantenimientoActivoId", ignore = true)
    @Mapping(target = "activo", source = "dto.estadoActivo")
    @Mapping(target = "criterios", ignore = true)
    void updateDomain(ProgramacionMantenimientoUpdate dto, @MappingTarget ProgramacionMantenimiento domain);
}
