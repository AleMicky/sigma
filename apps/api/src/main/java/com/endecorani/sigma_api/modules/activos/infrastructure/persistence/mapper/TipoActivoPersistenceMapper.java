package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;


import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoActivoPersistenceMapper {

    public TipoActivoEntity toEntity(
            TipoActivo domain
    ) {
        if (domain == null) {
            return null;
        }

        TipoActivoEntity entity =
                new TipoActivoEntity();

        entity.setId(domain.getId());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setActivo(domain.isActivo());

        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());

        return entity;
    }

    public TipoActivo toDomain(
            TipoActivoEntity entity
    ) {
        if (entity == null) {
            return null;
        }

        return TipoActivo.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}