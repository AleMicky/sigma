package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicularAdjunto;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularAdjuntoEntity;
import org.springframework.stereotype.Component;

@Component
public class SolicitudVehicularAdjuntoPersistenceMapper {

    public SolicitudVehicularAdjuntoEntity toEntity(SolicitudVehicularAdjunto domain) {
        if (domain == null) {
            return null;
        }

        SolicitudVehicularAdjuntoEntity entity = new SolicitudVehicularAdjuntoEntity();
        entity.setId(domain.getId());
        entity.setSolicitudVehicularId(domain.getSolicitudVehicularId());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setNombreOriginal(domain.getNombreOriginal());
        entity.setUrl(domain.getUrl());
        entity.setMimeType(domain.getMimeType());
        entity.setSize(domain.getSize());
        entity.setDescripcion(domain.getDescripcion());
        return entity;
    }

    public SolicitudVehicularAdjunto toDomain(SolicitudVehicularAdjuntoEntity entity) {
        if (entity == null) {
            return null;
        }

        return SolicitudVehicularAdjunto.builder()
                .id(entity.getId())
                .solicitudVehicularId(entity.getSolicitudVehicularId())
                .nombreArchivo(entity.getNombreArchivo())
                .nombreOriginal(entity.getNombreOriginal())
                .url(entity.getUrl())
                .mimeType(entity.getMimeType())
                .size(entity.getSize())
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
