package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.parametros.domain.model.CatalogoItem;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoItemEntity;
import org.springframework.stereotype.Component;

@Component
public class CatalogoItemPersistenceMapper {

    public CatalogoItemEntity toEntity(CatalogoItem domain) {
        if (domain == null) {
            return null;
        }

        CatalogoItemEntity entity = new CatalogoItemEntity();
        entity.setId(domain.getId());
        entity.setNombre(domain.getNombre());
        entity.setValor(domain.getValor());
        entity.setOrden(domain.getOrden());

        if (domain.getCatalogoId() != null) {
            CatalogoEntity catalogo = new CatalogoEntity();
            catalogo.setId(domain.getCatalogoId());
            entity.setCatalogo(catalogo);
        }
        return entity;
    }

    public CatalogoItem toDomain(CatalogoItemEntity entity) {
        if (entity == null) {
            return null;
        }

        return CatalogoItem.builder()
                .id(entity.getId())
                .catalogoId(
                        entity.getCatalogo() != null
                                ? entity.getCatalogo().getId()
                                : null
                )
                .nombre(entity.getNombre())
                .valor(entity.getValor())
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
