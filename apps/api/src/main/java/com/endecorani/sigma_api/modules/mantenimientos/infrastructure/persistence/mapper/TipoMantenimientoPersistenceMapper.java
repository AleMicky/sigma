package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoMantenimientoPersistenceMapper {

    public TipoMantenimientoEntity toEntity(
            TipoMantenimiento domain
    ) {

        return TipoMantenimientoEntity.builder()
                .id(domain.getId())
                .codigo(domain.getCodigo())
                .nombre(domain.getNombre())
                .descripcion(domain.getDescripcion())
                .build();
    }

    public TipoMantenimiento toDomain(
            TipoMantenimientoEntity entity
    ) {

        return TipoMantenimiento.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
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