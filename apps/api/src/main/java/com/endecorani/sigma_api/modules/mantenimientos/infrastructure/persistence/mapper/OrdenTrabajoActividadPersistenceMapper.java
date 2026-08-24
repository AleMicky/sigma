package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEntity;
import org.springframework.stereotype.Component;

@Component
public class OrdenTrabajoActividadPersistenceMapper {

    public OrdenTrabajoActividadEntity toEntity(OrdenTrabajoActividad domain) {
        if (domain == null) {
            return null;
        }

        OrdenTrabajoActividadEntity entity = new OrdenTrabajoActividadEntity();

        entity.setId(domain.getId());
        entity.setOrdenTrabajoId(domain.getOrdenTrabajoId());
        entity.setActividadMantenimientoId(domain.getActividadMantenimientoId());
        entity.setDescripcion(domain.getDescripcion());
        entity.setRealizado(domain.isRealizado());
        entity.setObservacion(domain.getObservacion());
        entity.setFechaRealizacion(domain.getFechaRealizacion());

        return entity;
    }

    public OrdenTrabajoActividad toDomain(OrdenTrabajoActividadEntity entity) {
        if (entity == null) {
            return null;
        }

        return OrdenTrabajoActividad.builder()
                .id(entity.getId())
                .ordenTrabajoId(entity.getOrdenTrabajoId())
                .actividadMantenimientoId(entity.getActividadMantenimientoId())
                .descripcion(entity.getDescripcion())
                .realizado(entity.isRealizado())
                .observacion(entity.getObservacion())
                .fechaRealizacion(entity.getFechaRealizacion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
