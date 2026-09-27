package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehiculo;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehiculoEntity;
import org.springframework.stereotype.Component;

@Component
public class FlotaVehiculoPersistenceMapper {

    public FlotaVehiculoEntity toEntity(FlotaVehiculo domain) {
        if (domain == null) {
            return null;
        }

        return FlotaVehiculoEntity.builder()
                .id(domain.getId())
                .flotaVehicularId(domain.getFlotaVehicularId())
                .activoId(domain.getActivoId())
                .activo(domain.isActivo())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .createdBy(domain.getCreatedBy())
                .updatedBy(domain.getUpdatedBy())
                .createdById(domain.getCreatedById())
                .updatedById(domain.getUpdatedById())
                .build();
    }

    public FlotaVehiculo toDomain(FlotaVehiculoEntity entity) {
        if (entity == null) {
            return null;
        }

        return FlotaVehiculo.builder()
                .id(entity.getId())
                .flotaVehicularId(entity.getFlotaVehicularId())
                .activoId(entity.getActivoId())
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
