package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class ActividadMantenimientoPersistenceMapper {

    public ActividadMantenimientoEntity toEntity(ActividadMantenimiento domain) {

        if (domain == null) {
            return null;
        }

        ActividadMantenimientoEntity entity = new ActividadMantenimientoEntity();

        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setAplicaTodosTiposActivo(domain.getAplicaTodosTiposActivo());
        entity.setRequiereChecklist(domain.getRequiereChecklist());

        return entity;
    }

    public ActividadMantenimiento toDomain(ActividadMantenimientoEntity entity) {
        if (entity == null) {
            return null;
        }

        return ActividadMantenimiento.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .aplicaTodosTiposActivo(entity.getAplicaTodosTiposActivo())
                .requiereChecklist(entity.getRequiereChecklist())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }

}
