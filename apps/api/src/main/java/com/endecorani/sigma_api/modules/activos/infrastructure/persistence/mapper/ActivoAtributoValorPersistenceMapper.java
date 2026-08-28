package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributoValor;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import org.springframework.stereotype.Component;

@Component
public class ActivoAtributoValorPersistenceMapper {

    public ActivoAtributoValorEntity toEntity(ActivoAtributoValor domain) {
        if (domain == null) {
            return null;
        }

        ActivoAtributoValorEntity entity = new ActivoAtributoValorEntity();
        entity.setId(domain.getId());
        entity.setActivoId(domain.getActivoId());
        entity.setActivoAtributoId(domain.getActivoAtributoId());
        entity.setValor(domain.getValor());

        return entity;
    }

    public ActivoAtributoValor toDomain(ActivoAtributoValorEntity entity) {
        if (entity == null) {
            return null;
        }

        return ActivoAtributoValor.builder()
                .id(entity.getId())
                .activoId(entity.getActivoId())
                .activoAtributoId(entity.getActivoAtributoId())
                .valor(entity.getValor())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
