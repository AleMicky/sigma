package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEvidenciaEntity;
import org.springframework.stereotype.Component;

@Component
public class OrdenTrabajoActividadEvidenciaPersistenceMapper {

    public OrdenTrabajoActividadEvidenciaEntity toEntity(OrdenTrabajoActividadEvidencia domain) {
        if (domain == null) {
            return null;
        }

        OrdenTrabajoActividadEvidenciaEntity entity = new OrdenTrabajoActividadEvidenciaEntity();

        entity.setId(domain.getId());
        entity.setOrdenTrabajoActividadId(domain.getOrdenTrabajoActividadId());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setTipoMime(domain.getTipoMime());
        entity.setTamanio(domain.getTamanio());
        entity.setUrl(domain.getUrl());

        return entity;
    }

    public OrdenTrabajoActividadEvidencia toDomain(OrdenTrabajoActividadEvidenciaEntity entity) {
        if (entity == null) {
            return null;
        }

        return OrdenTrabajoActividadEvidencia.builder()
                .id(entity.getId())
                .ordenTrabajoActividadId(entity.getOrdenTrabajoActividadId())
                .nombreArchivo(entity.getNombreArchivo())
                .tipoMime(entity.getTipoMime())
                .tamanio(entity.getTamanio())
                .url(entity.getUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
