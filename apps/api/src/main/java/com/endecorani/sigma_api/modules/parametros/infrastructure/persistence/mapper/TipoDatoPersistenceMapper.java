package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.TipoDatoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoDatoPersistenceMapper {

    public TipoDatoEntity toEntity(TipoDato domain) {
        if (domain == null) {
            return null;
        }

        TipoDatoEntity entity = new TipoDatoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setPermiteOpciones(domain.getPermiteOpciones());

        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public TipoDato toDomain(TipoDatoEntity entity) {
        if (entity == null) {
            return null;
        }

        return TipoDato.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .permiteOpciones(entity.getPermiteOpciones())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
