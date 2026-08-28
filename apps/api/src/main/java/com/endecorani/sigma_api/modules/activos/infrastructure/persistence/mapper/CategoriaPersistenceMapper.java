package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.CategoriaEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoriaPersistenceMapper {

    public CategoriaEntity toEntity(Categoria domain) {
        if (domain == null) {
            return null;
        }

        CategoriaEntity entity = new CategoriaEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setOrden(domain.getOrden());

        return entity;
    }

    public Categoria toDomain(CategoriaEntity entity) {
        if (entity == null) {
            return null;
        }

        return Categoria.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .orden(entity.getOrden())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
