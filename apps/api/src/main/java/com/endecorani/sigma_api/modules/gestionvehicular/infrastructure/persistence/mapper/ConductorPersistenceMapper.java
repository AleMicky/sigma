package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import org.springframework.stereotype.Component;

@Component
public class ConductorPersistenceMapper {

    public ConductorEntity toEntity(Conductor domain) {
        if (domain == null) {
            return null;
        }

        ConductorEntity entity = new ConductorEntity();
        entity.setId(domain.getId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setNumeroLicencia(domain.getNumeroLicencia());
        entity.setCategoriaLicencia(domain.getCategoriaLicencia());
        entity.setFechaVencimiento(domain.getFechaVencimiento());
        entity.setActivo(domain.isActivo());
        return entity;
    }

    public Conductor toDomain(ConductorEntity entity) {
        if (entity == null) {
            return null;
        }

        return Conductor.builder()
                .id(entity.getId())
                .empleadoId(entity.getEmpleadoId())
                .numeroLicencia(entity.getNumeroLicencia())
                .categoriaLicencia(entity.getCategoriaLicencia())
                .fechaVencimiento(entity.getFechaVencimiento())
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
