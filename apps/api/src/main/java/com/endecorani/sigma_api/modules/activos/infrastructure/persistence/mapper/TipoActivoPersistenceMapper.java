package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoActivoPersistenceMapper {

    public TipoActivoEntity toEntity(TipoActivo domain) {
        if (domain == null) {
            return null;
        }

        TipoActivoEntity entity = new TipoActivoEntity();
        entity.setId(domain.getId());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setColor(domain.getColor());
        entity.setIcono(domain.getIcono());

        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public TipoActivo toDomain(TipoActivoEntity entity) {
        if (entity == null) {
            return null;
        }

        return TipoActivo.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .color(entity.getColor())
                .icono(entity.getIcono())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
