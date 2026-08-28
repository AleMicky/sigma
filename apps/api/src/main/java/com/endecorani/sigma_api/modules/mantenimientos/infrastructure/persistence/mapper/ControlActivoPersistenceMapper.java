package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoEntity;
import org.springframework.stereotype.Component;

@Component
public class ControlActivoPersistenceMapper {

    public ControlActivoEntity toEntity(ControlActivo domain) {

        if (domain == null) {
            return null;
        }

        ControlActivoEntity entity = new ControlActivoEntity();

        entity.setId(domain.getId());
        entity.setSolicitudMantenimientoId(domain.getSolicitudMantenimientoId());
        entity.setOrdenTrabajoId(domain.getOrdenTrabajoId());
        entity.setActivoId(domain.getActivoId());
        entity.setTipo(domain.getTipo());
        entity.setEntregadoPorId(domain.getEntregadoPorId());
        entity.setRecibidoPorId(domain.getRecibidoPorId());
        entity.setFecha(domain.getFecha());
        entity.setConforme(domain.isConforme());
        entity.setObservacion(domain.getObservacion());

        return entity;
    }

    public ControlActivo toDomain(ControlActivoEntity entity) {
        if (entity == null) {
            return null;
        }

        return ControlActivo.builder()
                .id(entity.getId())
                .solicitudMantenimientoId(entity.getSolicitudMantenimientoId())
                .ordenTrabajoId(entity.getOrdenTrabajoId())
                .activoId(entity.getActivoId())
                .tipo(entity.getTipo())
                .entregadoPorId(entity.getEntregadoPorId())
                .recibidoPorId(entity.getRecibidoPorId())
                .fecha(entity.getFecha())
                .conforme(entity.isConforme())
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
