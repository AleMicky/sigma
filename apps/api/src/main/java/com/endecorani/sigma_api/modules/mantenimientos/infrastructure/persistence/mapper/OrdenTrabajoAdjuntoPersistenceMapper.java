package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoAdjuntoEntity;
import org.springframework.stereotype.Component;

@Component
public class OrdenTrabajoAdjuntoPersistenceMapper {

    public OrdenTrabajoAdjuntoEntity toEntity(OrdenTrabajoAdjunto domain) {
        if (domain == null) {
            return null;
        }

        OrdenTrabajoAdjuntoEntity entity = new OrdenTrabajoAdjuntoEntity();

        entity.setId(domain.getId());
        entity.setOrdenTrabajoId(domain.getOrdenTrabajoId());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setTipoMime(domain.getTipoMime());
        entity.setTamanio(domain.getTamanio());
        entity.setUrl(domain.getUrl());
        entity.setDescripcion(domain.getDescripcion());

        return entity;
    }

    public OrdenTrabajoAdjunto toDomain(OrdenTrabajoAdjuntoEntity entity) {
        if (entity == null) {
            return null;
        }

        return OrdenTrabajoAdjunto.builder()
                .id(entity.getId())
                .ordenTrabajoId(entity.getOrdenTrabajoId())
                .nombreArchivo(entity.getNombreArchivo())
                .tipoMime(entity.getTipoMime())
                .tamanio(entity.getTamanio())
                .url(entity.getUrl())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
