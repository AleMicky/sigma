package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoInsumoPersistenceMapper {

    public TipoInsumoEntity toEntity(com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumo domain) {
        if (domain == null) {
            return null;
        }

        TipoInsumoEntity entity = new TipoInsumoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());

        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumo toDomain(TipoInsumoEntity entity) {
        if (entity == null) {
            return null;
        }

        return com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumo.builder()
                .id(entity.getId())
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
