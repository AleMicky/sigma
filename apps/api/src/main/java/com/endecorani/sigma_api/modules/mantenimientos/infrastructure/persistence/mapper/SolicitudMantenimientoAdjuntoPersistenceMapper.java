package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoAdjuntoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class SolicitudMantenimientoAdjuntoPersistenceMapper {

    public SolicitudMantenimientoAdjuntoEntity toEntity(
            SolicitudMantenimientoAdjunto domain
    ) {
        if (domain == null) {
            return null;
        }

        SolicitudMantenimientoAdjuntoEntity entity =
                new SolicitudMantenimientoAdjuntoEntity();

        entity.setId(domain.getId());

        if (domain.getSolicitudMantenimientoId() != null) {
            SolicitudMantenimientoEntity parent =
                    new SolicitudMantenimientoEntity();
            parent.setId(
                    domain.getSolicitudMantenimientoId()
            );
            entity.setSolicitudMantenimiento(parent);
        }

        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setTipoContenido(domain.getTipoContenido());
        entity.setSize(domain.getSize());
        entity.setUrl(domain.getUrl());
        entity.setDescripcion(domain.getDescripcion());

        return entity;
    }

    public SolicitudMantenimientoAdjunto toDomain(
            SolicitudMantenimientoAdjuntoEntity entity
    ) {
        if (entity == null) {
            return null;
        }

        SolicitudMantenimientoAdjunto.SolicitudMantenimientoAdjuntoBuilder
                builder = SolicitudMantenimientoAdjunto.builder()
                .id(entity.getId())
                .nombreArchivo(entity.getNombreArchivo())
                .tipoContenido(entity.getTipoContenido())
                .size(entity.getSize())
                .url(entity.getUrl())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy());

        if (entity.getSolicitudMantenimiento() != null) {
            builder.solicitudMantenimientoId(
                    entity.getSolicitudMantenimiento().getId()
            );
        }

        return builder.build();
    }
}
