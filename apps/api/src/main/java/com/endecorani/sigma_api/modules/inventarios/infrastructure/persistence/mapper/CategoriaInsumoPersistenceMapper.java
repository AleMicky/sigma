package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.CategoriaInsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoriaInsumoPersistenceMapper {

    public CategoriaInsumoEntity toEntity(CategoriaInsumo domain) {
        if (domain == null) {
            return null;
        }

        CategoriaInsumoEntity entity = new CategoriaInsumoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());

        if (domain.getTipoInsumoId() != null) {
            TipoInsumoEntity tipoInsumo = new TipoInsumoEntity();
            tipoInsumo.setId(domain.getTipoInsumoId());
            entity.setTipoInsumo(tipoInsumo);
        }

        return entity;
    }

    public CategoriaInsumo toDomain(CategoriaInsumoEntity entity) {
        if (entity == null) {
            return null;
        }

        return CategoriaInsumo.builder()
                .id(entity.getId())
                .tipoInsumoId(
                        entity.getTipoInsumo() != null
                                ? entity.getTipoInsumo().getId()
                                : null
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
