package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoActivoEntity;
import org.springframework.stereotype.Component;

@Component
public class PlanMantenimientoActivoPersistenceMapper {

    public PlanMantenimientoActivoEntity toEntity(PlanMantenimientoActivo domain) {
        if (domain == null) {
            return null;
        }

        PlanMantenimientoActivoEntity entity = new PlanMantenimientoActivoEntity();
        entity.setId(domain.getId());
        entity.setPlanMantenimientoId(domain.getPlanMantenimientoId());
        entity.setActivoId(domain.getActivoId());
        entity.setResponsableId(domain.getResponsableId());
        entity.setFechaInicio(domain.getFechaInicio());
        entity.setFechaFin(domain.getFechaFin());
        entity.setEstadoActivo(domain.getActivo() != null ? domain.getActivo() : true);
        return entity;
    }

    public PlanMantenimientoActivo toDomain(PlanMantenimientoActivoEntity entity) {
        if (entity == null) {
            return null;
        }

        return PlanMantenimientoActivo.builder()
                .id(entity.getId())
                .planMantenimientoId(entity.getPlanMantenimientoId())
                .activoId(entity.getActivoId())
                .responsableId(entity.getResponsableId())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
