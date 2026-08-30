package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import org.springframework.stereotype.Component;

@Component
public class PrioridadPersistenceMapper {

    public PrioridadEntity toEntity(Prioridad domain) {

        if (domain == null) {
            return null;
        }

        PrioridadEntity entity = new PrioridadEntity();

        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setNivel(domain.getNivel());
        entity.setPorDefecto(Boolean.TRUE.equals(domain.getPorDefecto()));

        return entity;
    }

    public Prioridad toDomain(PrioridadEntity entity) {
        if (entity == null) {
            return null;
        }

        return Prioridad.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .nivel(entity.getNivel())
                .porDefecto(Boolean.TRUE.equals(entity.getPorDefecto()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }

}