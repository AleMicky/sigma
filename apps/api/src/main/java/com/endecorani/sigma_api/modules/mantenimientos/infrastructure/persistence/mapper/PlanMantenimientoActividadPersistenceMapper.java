package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoActividadEntity;
import org.springframework.stereotype.Component;

@Component
public class PlanMantenimientoActividadPersistenceMapper {

    public PlanMantenimientoActividadEntity toEntity(PlanMantenimientoActividad domain) {
        if (domain == null) {
            return null;
        }

        PlanMantenimientoActividadEntity entity = new PlanMantenimientoActividadEntity();
        entity.setId(domain.getId());
        entity.setPlanMantenimientoId(domain.getPlanMantenimientoId());
        entity.setActividadMantenimientoAplicacionId(domain.getActividadMantenimientoAplicacionId());
        entity.setOrden(domain.getOrden() != null ? domain.getOrden() : 0);
        entity.setObligatorio(domain.getObligatorio() != null ? domain.getObligatorio() : true);
        return entity;
    }

    public PlanMantenimientoActividad toDomain(PlanMantenimientoActividadEntity entity) {
        if (entity == null) {
            return null;
        }

        return PlanMantenimientoActividad.builder()
                .id(entity.getId())
                .planMantenimientoId(entity.getPlanMantenimientoId())
                .actividadMantenimientoAplicacionId(entity.getActividadMantenimientoAplicacionId())
                .orden(entity.getOrden())
                .obligatorio(entity.getObligatorio())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
