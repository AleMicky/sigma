package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistItemUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.request.ChecklistMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
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
public interface ChecklistMapper {

    @Mapping(target = "id", ignore = true)
    ChecklistMantenimiento toDomain(ChecklistMantenimientoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    ChecklistMantenimientoResponse toResponse(ChecklistMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(ChecklistMantenimientoUpdate dto, @MappingTarget ChecklistMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(ChecklistMantenimientoRequest dto, @MappingTarget ChecklistMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    ChecklistItem toItemDomain(ChecklistItemRequest dto);

    @Mapping(target = "checklistMantenimientoId", ignore = true)
    void updateItemDomain(ChecklistItemUpdate dto, @MappingTarget ChecklistItem domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "checklistMantenimientoId", ignore = true)
    void updateItemFromRequest(ChecklistItemRequest dto, @MappingTarget ChecklistItem domain);

    @Mapping(target = "auditoria", source = ".")
    ChecklistItemResponse toItemResponse(ChecklistItem domain);
}
