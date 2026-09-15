package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoAplicacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoAplicacionUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoAplicacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
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
public interface ActividadMantenimientoMapper {

    @Mapping(target = "id", ignore = true)
    ActividadMantenimiento toDomain(ActividadMantenimientoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    ActividadMantenimientoResponse toResponse(ActividadMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(ActividadMantenimientoUpdate dto, @MappingTarget ActividadMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(ActividadMantenimientoRequest dto, @MappingTarget ActividadMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    ActividadMantenimientoAplicacion toAplicacionDomain(ActividadMantenimientoAplicacionRequest dto);

    @Mapping(target = "actividadMantenimientoId", ignore = true)
    void updateAplicacionDomain(ActividadMantenimientoAplicacionUpdate dto, @MappingTarget ActividadMantenimientoAplicacion domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "actividadMantenimientoId", ignore = true)
    void updateAplicacionFromRequest(ActividadMantenimientoAplicacionRequest dto, @MappingTarget ActividadMantenimientoAplicacion domain);

    ActividadMantenimientoAplicacionResponse toAplicacionResponse(ActividadMantenimientoAplicacion domain);

    @Mapping(target = "id", ignore = true)
    ChecklistItem toChecklistItemDomain(ChecklistItemRequest dto);

    @Mapping(target = "auditoria", source = ".")
    ChecklistItemResponse toChecklistItemResponse(ChecklistItem domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "actividadMantenimientoId", ignore = true)
    void updateChecklistItemDomain(ChecklistItemUpdate dto, @MappingTarget ChecklistItem domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "actividadMantenimientoId", ignore = true)
    void updateChecklistItemFromRequest(ChecklistItemRequest dto, @MappingTarget ChecklistItem domain);
}
