package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoDetalleEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ControlActivoPersistenceMapper {

    public ControlActivoEntity toEntity(ControlActivo domain) {
        if (domain == null) return null;

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

        if (domain.getDetalles() != null) {
            entity.setDetalles(domain.getDetalles().stream()
                    .map(this::toDetalleEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    public ControlActivo toDomain(ControlActivoEntity entity) {
        if (entity == null) return null;

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
                .detalles(entity.getDetalles() != null ? entity.getDetalles().stream()
                        .map(this::toDetalleDomain)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public ControlActivoDetalleEntity toDetalleEntity(ControlActivoDetalle domain) {
        if (domain == null) return null;

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

    public ControlActivoDetalle toDetalleDomain(ControlActivoDetalleEntity entity) {
        if (entity == null) return null;

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
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
