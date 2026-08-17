package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class ChecklistMantenimientoPersistenceMapper {

    public ChecklistMantenimientoEntity toEntity(
            ChecklistMantenimiento domain
    ) {
        if (domain == null) {
            return null;
        }

        ChecklistMantenimientoEntity entity =
                new ChecklistMantenimientoEntity();

        entity.setId(domain.getId());
        entity.setActividadMantenimientoId(
                domain.getActividadMantenimientoId()
        );
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());

        return entity;
    }

    public ChecklistMantenimiento toDomain(
            ChecklistMantenimientoEntity entity
    ) {
        if (entity == null) {
            return null;
        }

        return ChecklistMantenimiento.builder()
                .id(entity.getId())
                .actividadMantenimientoId(
                        entity.getActividadMantenimientoId()
                )
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
