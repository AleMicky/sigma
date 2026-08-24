package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoDetalleEntity;
import org.springframework.stereotype.Component;

@Component
public class ControlActivoDetallePersistenceMapper {

    public ControlActivoDetalleEntity toEntity(ControlActivoDetalle domain) {

        if (domain == null) {
            return null;
        }

        ControlActivoDetalleEntity entity = new ControlActivoDetalleEntity();

        entity.setId(domain.getId());
        entity.setControlActivoId(domain.getControlActivoId());
        entity.setAccesorioId(domain.getAccesorioId());
        entity.setCantidadEsperada(domain.getCantidadEsperada());
        entity.setCantidadEncontrada(domain.getCantidadEncontrada());
        entity.setConforme(domain.isConforme());
        entity.setObservacion(domain.getObservacion());

        return entity;
    }

    public ControlActivoDetalle toDomain(ControlActivoDetalleEntity entity) {
        if (entity == null) {
            return null;
        }

        return ControlActivoDetalle.builder()
                .id(entity.getId())
                .controlActivoId(entity.getControlActivoId())
                .accesorioId(entity.getAccesorioId())
                .cantidadEsperada(entity.getCantidadEsperada())
                .cantidadEncontrada(entity.getCantidadEncontrada())
                .conforme(entity.isConforme())
                .observacion(entity.getObservacion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
