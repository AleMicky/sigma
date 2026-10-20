package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoCriterioResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ProgramacionMantenimientoCriterioMapper {

    @Mapping(target = "id", source = "dto.id")
    @Mapping(target = "programacionMantenimientoId", ignore = true)
    @Mapping(target = "activo", expression = "java(dto.activo())")
    ProgramacionMantenimientoCriterio toDomain(ProgramacionMantenimientoCriterioRequest dto);

    @Mapping(target = "auditoria", source = ".")
    ProgramacionMantenimientoCriterioResponse toResponse(ProgramacionMantenimientoCriterio domain);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "programacionMantenimientoId", ignore = true)
    @Mapping(target = "activo", source = "dto.estadoActivo")
    void updateDomain(ProgramacionMantenimientoCriterioUpdate dto, @MappingTarget ProgramacionMantenimientoCriterio domain);
}
