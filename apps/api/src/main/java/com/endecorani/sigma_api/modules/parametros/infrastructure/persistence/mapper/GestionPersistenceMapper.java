package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.parametros.domain.model.Gestion;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.GestionEntity;
import org.springframework.stereotype.Component;

@Component
public class GestionPersistenceMapper {

    public GestionEntity toEntity(Gestion domain) {
        if (domain == null) {
            return null;
        }

        GestionEntity entity = new GestionEntity();
        entity.setId(domain.getId());
        entity.setGestion(domain.getGestion());
        entity.setFechaInicio(domain.getFechaInicio());
        entity.setFechaFin(domain.getFechaFin());
        return entity;
    }

    public Gestion toDomain(GestionEntity entity) {
        if (entity == null) {
            return null;
        }

        return Gestion.builder()
                .id(entity.getId())
                .gestion(entity.getGestion())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
