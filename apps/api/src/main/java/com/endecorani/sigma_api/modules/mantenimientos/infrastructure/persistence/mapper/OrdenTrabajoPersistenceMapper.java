package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoEntity;
import org.springframework.stereotype.Component;

@Component
public class OrdenTrabajoPersistenceMapper {

    public OrdenTrabajoEntity toEntity(OrdenTrabajo domain) {
        if (domain == null) {
            return null;
        }

        OrdenTrabajoEntity entity = new OrdenTrabajoEntity();

        entity.setId(domain.getId());
        entity.setNumero(domain.getNumero());
        entity.setSolicitudMantenimientoId(domain.getSolicitudMantenimientoId());
        entity.setActivoId(domain.getActivoId());
        entity.setResponsableId(domain.getResponsableId());
        entity.setFechaInicio(domain.getFechaInicio());
        entity.setFechaFin(domain.getFechaFin());
        entity.setDiagnostico(domain.getDiagnostico());
        entity.setTrabajoRealizado(domain.getTrabajoRealizado());
        entity.setObservacion(domain.getObservacion());

        return entity;
    }

    public OrdenTrabajo toDomain(OrdenTrabajoEntity entity) {
        if (entity == null) {
            return null;
        }

        return OrdenTrabajo.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .solicitudMantenimientoId(entity.getSolicitudMantenimientoId())
                .activoId(entity.getActivoId())
                .responsableId(entity.getResponsableId())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .diagnostico(entity.getDiagnostico())
                .trabajoRealizado(entity.getTrabajoRealizado())
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
