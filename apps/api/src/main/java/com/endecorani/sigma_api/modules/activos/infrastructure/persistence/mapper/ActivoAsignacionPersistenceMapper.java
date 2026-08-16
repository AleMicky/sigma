package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAsignacion;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAsignacionEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import org.springframework.stereotype.Component;

@Component
public class ActivoAsignacionPersistenceMapper {

    public ActivoAsignacionEntity toEntity(ActivoAsignacion domain) {
        if (domain == null) {
            return null;
        }

        ActivoAsignacionEntity entity = new ActivoAsignacionEntity();
        entity.setId(domain.getId());

        if (domain.getActivoId() != null) {
            ActivoEntity activo = new ActivoEntity();
            activo.setId(domain.getActivoId());
            entity.setActivo(activo);
        }

        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setAreaId(domain.getAreaId());
        entity.setFechaAsignacion(domain.getFechaAsignacion());
        entity.setFechaDevolucion(domain.getFechaDevolucion());
        entity.setObservacionAsignacion(domain.getObservacionAsignacion());
        entity.setObservacionDevolucion(domain.getObservacionDevolucion());

        return entity;
    }

    public ActivoAsignacion toDomain(ActivoAsignacionEntity entity) {
        if (entity == null) {
            return null;
        }

        return ActivoAsignacion.builder()
                .id(entity.getId())
                .activoId(entity.getActivo() != null ? entity.getActivo().getId() : null)
                .empleadoId(entity.getEmpleadoId())
                .areaId(entity.getAreaId())
                .fechaAsignacion(entity.getFechaAsignacion())
                .fechaDevolucion(entity.getFechaDevolucion())
                .observacionAsignacion(entity.getObservacionAsignacion())
                .observacionDevolucion(entity.getObservacionDevolucion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
