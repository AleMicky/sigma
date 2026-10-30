package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteEvidencia;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteActivoEntity;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteEvidenciaEntity;
import org.springframework.stereotype.Component;

@Component
public class IncidenteEvidenciaPersistenceMapper {

    public IncidenteEvidenciaEntity toEntity(IncidenteEvidencia domain) {
        if (domain == null) {
            return null;
        }

        IncidenteEvidenciaEntity entity = new IncidenteEvidenciaEntity();
        entity.setId(domain.getId());
        if (domain.getIncidenteActivoId() != null) {
            IncidenteActivoEntity incidente = new IncidenteActivoEntity();
            incidente.setId(domain.getIncidenteActivoId());
            entity.setIncidenteActivo(incidente);
        }
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setUrl(domain.getUrl());
        entity.setMimeType(domain.getMimeType());
        entity.setSize(domain.getSize());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setCreatedById(domain.getCreatedById());
        entity.setUpdatedById(domain.getUpdatedById());
        return entity;
    }

    public void updateEntity(IncidenteEvidencia domain, IncidenteEvidenciaEntity entity) {
        if (domain == null || entity == null) {
            return;
        }
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setUrl(domain.getUrl());
        entity.setMimeType(domain.getMimeType());
        entity.setSize(domain.getSize());
    }

    public IncidenteEvidencia toDomain(IncidenteEvidenciaEntity entity) {
        if (entity == null) {
            return null;
        }

        return IncidenteEvidencia.builder()
                .id(entity.getId())
                .incidenteActivoId(entity.getIncidenteActivo() != null ? entity.getIncidenteActivo().getId() : null)
                .nombreArchivo(entity.getNombreArchivo())
                .url(entity.getUrl())
                .mimeType(entity.getMimeType())
                .size(entity.getSize())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}

