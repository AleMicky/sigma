package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.CargaCombustible;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.CargaCombustibleEntity;
import org.springframework.stereotype.Component;

@Component
public class CargaCombustiblePersistenceMapper {

    public CargaCombustibleEntity toEntity(CargaCombustible domain) {
        if (domain == null) {
            return null;
        }

        CargaCombustibleEntity entity = new CargaCombustibleEntity();
        entity.setId(domain.getId());
        entity.setActivoId(domain.getActivoId());
        entity.setViajeVehicularId(domain.getViajeVehicularId());
        entity.setSalidaVehicularId(domain.getSalidaVehicularId());
        entity.setInsumoId(domain.getInsumoId());
        entity.setFechaCarga(domain.getFechaCarga());
        entity.setLitros(domain.getLitros());
        entity.setPrecioTotal(domain.getPrecioTotal());
        entity.setNumeroFactura(domain.getNumeroFactura());
        entity.setEmpleadoId(domain.getEmpleadoId());
        return entity;
    }

    public CargaCombustible toDomain(CargaCombustibleEntity entity) {
        if (entity == null) {
            return null;
        }

        return CargaCombustible.builder()
                .id(entity.getId())
                .activoId(entity.getActivoId())
                .viajeVehicularId(entity.getViajeVehicularId())
                .salidaVehicularId(entity.getSalidaVehicularId())
                .insumoId(entity.getInsumoId())
                .fechaCarga(entity.getFechaCarga())
                .litros(entity.getLitros())
                .precioTotal(entity.getPrecioTotal())
                .numeroFactura(entity.getNumeroFactura())
                .empleadoId(entity.getEmpleadoId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
