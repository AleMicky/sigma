package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ViajeVehicularEntity;
import org.springframework.stereotype.Component;

@Component
public class ViajeVehicularPersistenceMapper {

    public ViajeVehicularEntity toEntity(ViajeVehicular domain) {
        if (domain == null) {
            return null;
        }

        ViajeVehicularEntity entity = new ViajeVehicularEntity();
        entity.setId(domain.getId());
        entity.setAsignacionVehicularId(domain.getAsignacionVehicularId());
        entity.setFechaSalidaReal(domain.getFechaSalidaReal());
        entity.setKilometrajeSalida(domain.getKilometrajeSalida());
        entity.setFechaRetornoReal(domain.getFechaRetornoReal());
        entity.setKilometrajeRetorno(domain.getKilometrajeRetorno());
        entity.setEstado(domain.getEstado());
        entity.setObservacion(domain.getObservacion());
        return entity;
    }

    public ViajeVehicular toDomain(ViajeVehicularEntity entity) {
        if (entity == null) {
            return null;
        }

        return ViajeVehicular.builder()
                .id(entity.getId())
                .asignacionVehicularId(entity.getAsignacionVehicularId())
                .fechaSalidaReal(entity.getFechaSalidaReal())
                .kilometrajeSalida(entity.getKilometrajeSalida())
                .fechaRetornoReal(entity.getFechaRetornoReal())
                .kilometrajeRetorno(entity.getKilometrajeRetorno())
                .estado(entity.getEstado())
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
