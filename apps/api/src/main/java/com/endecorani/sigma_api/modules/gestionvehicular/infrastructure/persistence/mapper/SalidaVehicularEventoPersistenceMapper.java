package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SalidaVehicularEventoEntity;
import org.springframework.stereotype.Component;

@Component
public class SalidaVehicularEventoPersistenceMapper {

    public SalidaVehicularEventoEntity toEntity(SalidaVehicularEvento domain) {
        if (domain == null) {
            return null;
        }

        SalidaVehicularEventoEntity entity = new SalidaVehicularEventoEntity();
        entity.setId(domain.getId());
        entity.setSalidaVehicularId(domain.getSalidaVehicularId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setTipoEvento(domain.getTipoEvento());
        entity.setFechaHora(domain.getFechaHora());
        entity.setKilometraje(domain.getKilometraje());
        entity.setLatitud(domain.getLatitud());
        entity.setLongitud(domain.getLongitud());
        entity.setObservacion(domain.getObservacion());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setCreatedById(domain.getCreatedById());
        entity.setUpdatedById(domain.getUpdatedById());
        return entity;
    }

    public SalidaVehicularEvento toDomain(SalidaVehicularEventoEntity entity) {
        if (entity == null) {
            return null;
        }

        return SalidaVehicularEvento.builder()
                .id(entity.getId())
                .salidaVehicularId(entity.getSalidaVehicularId())
                .empleadoId(entity.getEmpleadoId())
                .tipoEvento(entity.getTipoEvento())
                .fechaHora(entity.getFechaHora())
                .kilometraje(entity.getKilometraje())
                .latitud(entity.getLatitud())
                .longitud(entity.getLongitud())
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
