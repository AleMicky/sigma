package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularDetalleEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component("gestionVehicularControlActivoPersistenceMapper")
public class ControlActivoVehicularPersistenceMapper {

    public ControlActivoVehicularEntity toEntity(ControlActivo domain) {
        if (domain == null) return null;

        ControlActivoVehicularEntity entity = new ControlActivoVehicularEntity();
        entity.setId(domain.getId());
        entity.setSolicitudVehicularId(domain.getSolicitudVehicularId());
        entity.setAsignacionVehicularId(domain.getAsignacionVehicularId());
        entity.setActivoId(domain.getActivoId());
        entity.setTipo(domain.getTipo());
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

    public ControlActivo toDomain(ControlActivoVehicularEntity entity) {
        if (entity == null) return null;

        return ControlActivo.builder()
                .id(entity.getId())
                .solicitudVehicularId(entity.getSolicitudVehicularId())
                .asignacionVehicularId(entity.getAsignacionVehicularId())
                .activoId(entity.getActivoId())
                .tipo(entity.getTipo())
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

    public ControlActivoVehicularDetalleEntity toDetalleEntity(ControlActivoDetalle domain) {
        if (domain == null) return null;

        ControlActivoVehicularDetalleEntity entity = new ControlActivoVehicularDetalleEntity();
        entity.setId(domain.getId());
        entity.setControlActivoId(domain.getControlActivoId());
        entity.setAccesorioId(domain.getAccesorioId());
        entity.setCantidadEsperada(domain.getCantidadEsperada());
        entity.setCantidadEncontrada(domain.getCantidadEncontrada());
        entity.setConforme(domain.isConforme());
        entity.setObservacion(domain.getObservacion());
        return entity;
    }

    public ControlActivoDetalle toDetalleDomain(ControlActivoVehicularDetalleEntity entity) {
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
