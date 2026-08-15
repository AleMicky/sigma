package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoMantenimientoPersistenceMapper {

    public TipoMantenimientoEntity toEntity(TipoMantenimiento domain) {

        if (domain == null) {
            return null;
        }

        TipoMantenimientoEntity entity = new TipoMantenimientoEntity();

        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());

        return entity;
    }

    public TipoMantenimiento toDomain(TipoMantenimientoEntity entity) {
        if (entity == null) {
            return null;
        }

        return TipoMantenimiento.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }

}