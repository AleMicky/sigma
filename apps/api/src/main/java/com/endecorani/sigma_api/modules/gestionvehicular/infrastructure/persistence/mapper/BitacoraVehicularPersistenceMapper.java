package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.BitacoraVehicularEntity;
import org.springframework.stereotype.Component;

@Component
public class BitacoraVehicularPersistenceMapper {

    public BitacoraVehicularEntity toEntity(BitacoraVehicular domain) {
        if (domain == null) {
            return null;
        }

        BitacoraVehicularEntity entity = new BitacoraVehicularEntity();
        entity.setId(domain.getId());
        entity.setSalidaVehicularId(domain.getSalidaVehicularId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setTipo(domain.getTipo());
        entity.setFechaHora(domain.getFechaHora());
        entity.setDescripcion(domain.getDescripcion());
        entity.setLatitud(domain.getLatitud());
        entity.setLongitud(domain.getLongitud());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setCreatedById(domain.getCreatedById());
        entity.setUpdatedById(domain.getUpdatedById());
        return entity;
    }

    public BitacoraVehicular toDomain(BitacoraVehicularEntity entity) {
        if (entity == null) {
            return null;
        }

        return BitacoraVehicular.builder()
                .id(entity.getId())
                .salidaVehicularId(entity.getSalidaVehicularId())
                .empleadoId(entity.getEmpleadoId())
                .tipo(entity.getTipo())
                .fechaHora(entity.getFechaHora())
                .descripcion(entity.getDescripcion())
                .latitud(entity.getLatitud())
                .longitud(entity.getLongitud())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
