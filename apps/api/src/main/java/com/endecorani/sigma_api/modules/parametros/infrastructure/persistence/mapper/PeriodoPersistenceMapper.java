package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.parametros.domain.model.Periodo;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.GestionEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.PeriodoEntity;
import org.springframework.stereotype.Component;

@Component
public class PeriodoPersistenceMapper {

    public PeriodoEntity toEntity(Periodo domain) {
        if (domain == null) {
            return null;
        }

        PeriodoEntity entity = new PeriodoEntity();
        entity.setId(domain.getId());
        entity.setPeriodo(domain.getPeriodo());
        entity.setLiteral(domain.getLiteral());
        entity.setFechaInicio(domain.getFechaInicio());
        entity.setFechaFin(domain.getFechaFin());

        if (domain.getGestionId() != null) {
            GestionEntity gestion = new GestionEntity();
            gestion.setId(domain.getGestionId());
            entity.setGestion(gestion);
        }
        return entity;
    }

    public Periodo toDomain(PeriodoEntity entity) {
        if (entity == null) {
            return null;
        }

        return Periodo.builder()
                .id(entity.getId())
                .gestionId(
                        entity.getGestion() != null
                                ? entity.getGestion().getId()
                                : null
                )
                .periodo(entity.getPeriodo())
                .literal(entity.getLiteral())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
