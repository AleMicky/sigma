package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoHistorial;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoHistorialEntity;
import org.springframework.stereotype.Component;

@Component
public class ProgramacionMantenimientoHistorialPersistenceMapper {

    public ProgramacionMantenimientoHistorialEntity toEntity(ProgramacionMantenimientoHistorial domain) {
        if (domain == null) {
            return null;
        }

        ProgramacionMantenimientoHistorialEntity entity = new ProgramacionMantenimientoHistorialEntity();
        entity.setId(domain.getId());
        entity.setProgramacionMantenimientoId(domain.getProgramacionMantenimientoId());
        entity.setSolicitudMantenimientoId(domain.getSolicitudMantenimientoId());
        entity.setSolicitudNumero(domain.getSolicitudNumero());
        entity.setTipoCriterioDisparador(domain.getTipoCriterioDisparador());
        entity.setValorDisparador(domain.getValorDisparador());
        entity.setValorLimite(domain.getValorLimite());
        entity.setFechaDisparo(domain.getFechaDisparo());
        entity.setSnapshotValores(domain.getSnapshotValores());
        entity.setCompletado(domain.getCompletado() != null ? domain.getCompletado() : false);
        entity.setFechaServicio(domain.getFechaServicio());
        entity.setValorUsoServicio(domain.getValorUsoServicio());
        entity.setObservacion(domain.getObservacion());
        return entity;
    }

    public ProgramacionMantenimientoHistorial toDomain(ProgramacionMantenimientoHistorialEntity entity) {
        if (entity == null) {
            return null;
        }

        return ProgramacionMantenimientoHistorial.builder()
                .id(entity.getId())
                .programacionMantenimientoId(entity.getProgramacionMantenimientoId())
                .solicitudMantenimientoId(entity.getSolicitudMantenimientoId())
                .solicitudNumero(entity.getSolicitudNumero())
                .tipoCriterioDisparador(entity.getTipoCriterioDisparador())
                .valorDisparador(entity.getValorDisparador())
                .valorLimite(entity.getValorLimite())
                .fechaDisparo(entity.getFechaDisparo())
                .snapshotValores(entity.getSnapshotValores())
                .completado(entity.getCompletado())
                .fechaServicio(entity.getFechaServicio())
                .valorUsoServicio(entity.getValorUsoServicio())
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
