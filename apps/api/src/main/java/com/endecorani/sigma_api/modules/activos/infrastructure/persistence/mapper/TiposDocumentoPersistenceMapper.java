package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.TiposDocumento;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TiposDocumentoEntity;
import org.springframework.stereotype.Component;

@Component
public class TiposDocumentoPersistenceMapper {

    public TiposDocumentoEntity toEntity(TiposDocumento domain) {

        if (domain == null) {
            return null;
        }

        TiposDocumentoEntity entity = new TiposDocumentoEntity();

        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setRequiereVencimiento(domain.getRequiereVencimiento());

        return entity;
    }


    public TiposDocumento toDomain(TiposDocumentoEntity entity) {
        if (entity == null) {
            return null;
        }

        return TiposDocumento.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .requiereVencimiento(entity.getRequiereVencimiento())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }

}
