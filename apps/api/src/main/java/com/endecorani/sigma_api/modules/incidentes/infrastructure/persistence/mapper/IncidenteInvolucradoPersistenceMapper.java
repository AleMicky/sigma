package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteInvolucrado;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteActivoEntity;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteInvolucradoEntity;
import org.springframework.stereotype.Component;

@Component
public class IncidenteInvolucradoPersistenceMapper {

    public IncidenteInvolucradoEntity toEntity(IncidenteInvolucrado domain) {
        if (domain == null) {
            return null;
        }

        IncidenteInvolucradoEntity entity = new IncidenteInvolucradoEntity();
        entity.setId(domain.getId());
        if (domain.getIncidenteActivoId() != null) {
            IncidenteActivoEntity incidente = new IncidenteActivoEntity();
            incidente.setId(domain.getIncidenteActivoId());
            entity.setIncidenteActivo(incidente);
        }
        entity.setTipoInvolucrado(domain.getTipoInvolucrado());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setNombre(domain.getNombre());
        entity.setDocumentoIdentidad(domain.getDocumentoIdentidad());
        entity.setDescripcion(domain.getDescripcion());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setCreatedById(domain.getCreatedById());
        entity.setUpdatedById(domain.getUpdatedById());
        return entity;
    }

    public void updateEntity(IncidenteInvolucrado domain, IncidenteInvolucradoEntity entity) {
        if (domain == null || entity == null) {
            return;
        }
        entity.setTipoInvolucrado(domain.getTipoInvolucrado());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setNombre(domain.getNombre());
        entity.setDocumentoIdentidad(domain.getDocumentoIdentidad());
        entity.setDescripcion(domain.getDescripcion());
    }

    public IncidenteInvolucrado toDomain(IncidenteInvolucradoEntity entity) {
        if (entity == null) {
            return null;
        }

        return IncidenteInvolucrado.builder()
                .id(entity.getId())
                .incidenteActivoId(entity.getIncidenteActivo() != null ? entity.getIncidenteActivo().getId() : null)
                .tipoInvolucrado(entity.getTipoInvolucrado())
                .empleadoId(entity.getEmpleadoId())
                .nombre(entity.getNombre())
                .documentoIdentidad(entity.getDocumentoIdentidad())
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

