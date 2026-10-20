package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoCriterioEntity;
import org.springframework.stereotype.Component;

@Component
public class ProgramacionMantenimientoCriterioPersistenceMapper {

    public ProgramacionMantenimientoCriterioEntity toEntity(ProgramacionMantenimientoCriterio domain) {
        if (domain == null) {
            return null;
        }

        ProgramacionMantenimientoCriterioEntity entity = new ProgramacionMantenimientoCriterioEntity();
        entity.setId(domain.getId());
        entity.setProgramacionMantenimientoId(domain.getProgramacionMantenimientoId());
        entity.setTipoCriterio(domain.getTipoCriterio());
        entity.setIntervaloDias(domain.getIntervaloDias());
        entity.setIntervaloUso(domain.getIntervaloUso());
        entity.setProximaFecha(domain.getProximaFecha());
        entity.setProximoValorUso(domain.getProximoValorUso());
        entity.setActivo(domain.getActivo() != null ? domain.getActivo() : true);
        return entity;
    }

    public ProgramacionMantenimientoCriterio toDomain(ProgramacionMantenimientoCriterioEntity entity) {
        if (entity == null) {
            return null;
        }

        return ProgramacionMantenimientoCriterio.builder()
                .id(entity.getId())
                .programacionMantenimientoId(entity.getProgramacionMantenimientoId())
                .tipoCriterio(entity.getTipoCriterio())
                .intervaloDias(entity.getIntervaloDias())
                .intervaloUso(entity.getIntervaloUso())
                .proximaFecha(entity.getProximaFecha())
                .proximoValorUso(entity.getProximoValorUso())
                .activo(entity.getActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
