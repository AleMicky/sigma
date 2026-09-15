package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistMantenimientoEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ChecklistPersistenceMapper {

    public ChecklistMantenimientoEntity toEntity(ChecklistMantenimiento domain) {
        if (domain == null) return null;

        ChecklistMantenimientoEntity entity = new ChecklistMantenimientoEntity();
        entity.setId(domain.getId());
        entity.setActividadMantenimientoId(domain.getActividadMantenimientoId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());

        if (domain.getItems() != null) {
            entity.setItems(domain.getItems().stream()
                    .map(this::toItemEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    public ChecklistMantenimiento toDomain(ChecklistMantenimientoEntity entity) {
        if (entity == null) return null;

        return ChecklistMantenimiento.builder()
                .id(entity.getId())
                .actividadMantenimientoId(entity.getActividadMantenimientoId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .items(entity.getItems() != null ? entity.getItems().stream()
                        .map(this::toItemDomain)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public ChecklistItemEntity toItemEntity(ChecklistItem domain) {
        if (domain == null) return null;

        ChecklistItemEntity entity = new ChecklistItemEntity();
        entity.setId(domain.getId());
        entity.setChecklistMantenimientoId(domain.getChecklistMantenimientoId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setTipoDatoId(domain.getTipoDatoId());
        entity.setOrden(domain.getOrden());
        entity.setObligatorio(domain.getObligatorio() != null ? domain.getObligatorio() : false);
        entity.setOpciones(domain.getOpciones());
        return entity;
    }

    public ChecklistItem toItemDomain(ChecklistItemEntity entity) {
        if (entity == null) return null;

        return ChecklistItem.builder()
                .id(entity.getId())
                .checklistMantenimientoId(entity.getChecklistMantenimientoId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .tipoDatoId(entity.getTipoDatoId())
                .orden(entity.getOrden())
                .obligatorio(entity.getObligatorio())
                .opciones(entity.getOpciones())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
