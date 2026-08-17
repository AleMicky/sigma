package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import org.springframework.stereotype.Component;

@Component
public class ChecklistItemPersistenceMapper {

    public ChecklistItemEntity toEntity(ChecklistItem domain) {
        if (domain == null) {
            return null;
        }

        ChecklistItemEntity entity = new ChecklistItemEntity();

        entity.setId(domain.getId());
        entity.setChecklistMantenimientoId(
                domain.getChecklistMantenimientoId()
        );
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setTipoDatoId(domain.getTipoDatoId());
        entity.setOrden(domain.getOrden());
        entity.setObligatorio(domain.getObligatorio());
        entity.setOpciones(domain.getOpciones());

        return entity;
    }

    public ChecklistItem toDomain(ChecklistItemEntity entity) {
        if (entity == null) {
            return null;
        }

        return ChecklistItem.builder()
                .id(entity.getId())
                .checklistMantenimientoId(
                        entity.getChecklistMantenimientoId()
                )
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
                .build();
    }
}
