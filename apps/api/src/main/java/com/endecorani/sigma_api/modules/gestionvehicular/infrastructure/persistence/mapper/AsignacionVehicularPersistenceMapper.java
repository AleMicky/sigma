package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.AsignacionVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity;
import org.springframework.stereotype.Component;

@Component
public class AsignacionVehicularPersistenceMapper {

    public AsignacionVehicularEntity toEntity(AsignacionVehicular domain) {
        if (domain == null) {
            return null;
        }

        AsignacionVehicularEntity entity = new AsignacionVehicularEntity();
        entity.setId(domain.getId());
        entity.setSolicitudVehicularId(domain.getSolicitudVehicularId());
        entity.setActivoId(domain.getActivoId());
        entity.setConductorId(domain.getConductorId());
        entity.setAsignadoPorId(domain.getAsignadoPorId());
        entity.setFechaAsignacion(domain.getFechaAsignacion());
        entity.setObservacion(domain.getObservacion());
        return entity;
    }

    public AsignacionVehicular toDomain(AsignacionVehicularEntity entity) {
        if (entity == null) {
            return null;
        }

        return AsignacionVehicular.builder()
                .id(entity.getId())
                .solicitudVehicularId(entity.getSolicitudVehicularId())
                .activoId(entity.getActivoId())
                .conductorId(entity.getConductorId())
                .asignadoPorId(entity.getAsignadoPorId())
                .fechaAsignacion(entity.getFechaAsignacion())
                .observacion(entity.getObservacion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
