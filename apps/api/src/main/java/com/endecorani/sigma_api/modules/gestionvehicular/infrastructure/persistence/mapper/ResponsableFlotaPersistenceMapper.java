package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ResponsableFlota;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ResponsableFlotaEntity;
import org.springframework.stereotype.Component;

@Component
public class ResponsableFlotaPersistenceMapper {

    public ResponsableFlotaEntity toEntity(ResponsableFlota domain) {
        if (domain == null) {
            return null;
        }

        return ResponsableFlotaEntity.builder()
                .id(domain.getId())
                .flotaVehicularId(domain.getFlotaVehicularId())
                .empleadoId(domain.getEmpleadoId())
                .principal(domain.isPrincipal())
                .activo(domain.isActivo())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .createdBy(domain.getCreatedBy())
                .updatedBy(domain.getUpdatedBy())
                .createdById(domain.getCreatedById())
                .updatedById(domain.getUpdatedById())
                .build();
    }

    public ResponsableFlota toDomain(ResponsableFlotaEntity entity) {
        if (entity == null) {
            return null;
        }

        return ResponsableFlota.builder()
                .id(entity.getId())
                .flotaVehicularId(entity.getFlotaVehicularId())
                .empleadoId(entity.getEmpleadoId())
                .principal(entity.isPrincipal())
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
