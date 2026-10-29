package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SalidaVehicularEntity;
import org.springframework.stereotype.Component;

@Component
public class SalidaVehicularPersistenceMapper {

    public SalidaVehicularEntity toEntity(SalidaVehicular domain) {
        if (domain == null) {
            return null;
        }

        SalidaVehicularEntity entity = new SalidaVehicularEntity();
        entity.setId(domain.getId());
        entity.setNumero(domain.getNumero());
        entity.setActivoId(domain.getActivoId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setFecha(domain.getFecha());
        entity.setDescripcionActividad(domain.getDescripcionActividad());
        entity.setObservaciones(domain.getObservaciones());
        entity.setEstado(domain.getEstado());
        entity.setProcessInstanceId(domain.getProcessInstanceId());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setCreatedById(domain.getCreatedById());
        entity.setUpdatedById(domain.getUpdatedById());
        return entity;
    }

    public void updateEntity(SalidaVehicular domain, SalidaVehicularEntity entity) {
        if (domain == null || entity == null) {
            return;
        }
        entity.setNumero(domain.getNumero());
        entity.setActivoId(domain.getActivoId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setFecha(domain.getFecha());
        entity.setDescripcionActividad(domain.getDescripcionActividad());
        entity.setObservaciones(domain.getObservaciones());
        entity.setEstado(domain.getEstado());
        entity.setProcessInstanceId(domain.getProcessInstanceId());
    }

    public SalidaVehicular toDomain(SalidaVehicularEntity entity) {
        if (entity == null) {
            return null;
        }

        return SalidaVehicular.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .activoId(entity.getActivoId())
                .empleadoId(entity.getEmpleadoId())
                .fecha(entity.getFecha())
                .descripcionActividad(entity.getDescripcionActividad())
                .observaciones(entity.getObservaciones())
                .estado(entity.getEstado())
                .processInstanceId(entity.getProcessInstanceId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
