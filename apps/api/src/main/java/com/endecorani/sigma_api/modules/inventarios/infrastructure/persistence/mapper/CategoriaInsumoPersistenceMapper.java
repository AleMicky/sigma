package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.CategoriaInsumoEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoriaInsumoPersistenceMapper {

    public CategoriaInsumoEntity toEntity(com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo domain) {
        if (domain == null) {
            return null;
        }

        CategoriaInsumoEntity entity = new CategoriaInsumoEntity();
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

    public com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo toDomain(CategoriaInsumoEntity entity) {
        if (entity == null) {
            return null;
        }

        return com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo.builder()
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
