package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehicularEntity;
import org.springframework.stereotype.Component;

@Component
public class FlotaVehicularPersistenceMapper {

    public FlotaVehicularEntity toEntity(FlotaVehicular domain) {
        if (domain == null) {
            return null;
        }

        return FlotaVehicularEntity.builder()
                .id(domain.getId())
                .codigo(domain.getCodigo())
                .nombre(domain.getNombre())
                .descripcion(domain.getDescripcion())
                .activo(domain.isActivo())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .createdBy(domain.getCreatedBy())
                .updatedBy(domain.getUpdatedBy())
                .createdById(domain.getCreatedById())
                .updatedById(domain.getUpdatedById())
                .build();
    }

    public FlotaVehicular toDomain(FlotaVehicularEntity entity) {
        if (entity == null) {
            return null;
        }

        return FlotaVehicular.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
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
