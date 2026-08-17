package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoAplicacionEntity;
import org.springframework.stereotype.Component;

@Component
public class ActividadMantenimientoAplicacionPersistenceMapper {

    public ActividadMantenimientoAplicacionEntity toEntity(
            ActividadMantenimientoAplicacion domain
    ) {
        if (domain == null) {
            return null;
        }

        ActividadMantenimientoAplicacionEntity entity =
                new ActividadMantenimientoAplicacionEntity();

        entity.setId(domain.getId());
        entity.setActividadMantenimientoId(
                domain.getActividadMantenimientoId()
        );
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setComponenteId(domain.getComponenteId());

        return entity;
    }

    public ActividadMantenimientoAplicacion toDomain(
            ActividadMantenimientoAplicacionEntity entity
    ) {
        if (entity == null) {
            return null;
        }

        return ActividadMantenimientoAplicacion.builder()
                .id(entity.getId())
                .actividadMantenimientoId(
                        entity.getActividadMantenimientoId()
                )
                .tipoActivoId(entity.getTipoActivoId())
                .componenteId(entity.getComponenteId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
