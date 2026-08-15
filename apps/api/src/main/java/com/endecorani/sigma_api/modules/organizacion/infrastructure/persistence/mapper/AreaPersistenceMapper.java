package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Area;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.AreaEntity;
import org.springframework.stereotype.Component;

@Component
public class AreaPersistenceMapper {

    public AreaEntity toEntity(Area domain) {
        if (domain == null) {
            return null;
        }

        AreaEntity entity = new AreaEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setSistemaOrigen(domain.getSistemaOrigen());
        entity.setCodigoExterno(domain.getCodigoExterno());
        return entity;
    }

    public Area toDomain(AreaEntity entity) {
        if (entity == null) {
            return null;
        }

        return Area.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .sistemaOrigen(entity.getSistemaOrigen())
                .codigoExterno(entity.getCodigoExterno())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}