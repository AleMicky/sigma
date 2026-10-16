package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.EstadoOperativo;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.EstadoOperativoEntity;
import org.springframework.stereotype.Component;

@Component
public class EstadoOperativoPersistenceMapper {

    public EstadoOperativoEntity toEntity(EstadoOperativo domain) {
        if (domain == null) {
            return null;
        }

        EstadoOperativoEntity entity = new EstadoOperativoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setColor(domain.getColor());

        return entity;
    }

    public EstadoOperativo toDomain(EstadoOperativoEntity entity) {
        if (entity == null) {
            return null;
        }

        return EstadoOperativo.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .color(entity.getColor())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
