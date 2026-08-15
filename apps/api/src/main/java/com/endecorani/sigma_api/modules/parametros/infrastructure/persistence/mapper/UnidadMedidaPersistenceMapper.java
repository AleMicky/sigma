package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.parametros.domain.model.UnidadMedida;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UnidadMedidaEntity;
import org.springframework.stereotype.Component;

@Component
public class UnidadMedidaPersistenceMapper {

    public UnidadMedidaEntity toEntity(UnidadMedida domain) {
        if (domain == null) {
            return null;
        }

        UnidadMedidaEntity entity = new UnidadMedidaEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setSimbolo(domain.getSimbolo());
        entity.setPermiteDecimal(domain.getPermiteDecimal());

        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public UnidadMedida toDomain(UnidadMedidaEntity entity) {
        if (entity == null) {
            return null;
        }

        return UnidadMedida.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .simbolo(entity.getSimbolo())
                .permiteDecimal(entity.getPermiteDecimal())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
