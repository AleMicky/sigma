package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class SolicitudMantenimientoPersistenceMapper {

    public SolicitudMantenimientoEntity toEntity(SolicitudMantenimiento domain) {
        if (domain == null) {
            return null;
        }

        SolicitudMantenimientoEntity entity = new SolicitudMantenimientoEntity();
        entity.setId(domain.getId());
        entity.setNumero(domain.getNumero());
        entity.setActivoId(domain.getActivoId());
        
        entity.setTipoMantenimientoId(domain.getTipoMantenimientoId());
        entity.setTipoFallaId(domain.getTipoFallaId());
        entity.setPrioridadId(domain.getPrioridadId());
        
        entity.setSolicitanteId(domain.getSolicitanteId());
        entity.setTitulo(domain.getTitulo());
        entity.setDescripcion(domain.getDescripcion());
        entity.setFechaSolicitud(domain.getFechaSolicitud());
        
        entity.setAprobadorId(domain.getAprobadorId());
        entity.setResponsableId(domain.getResponsableId());
        entity.setSupervisorId(domain.getSupervisorId());
        
        entity.setFechaInicioMantenimiento(domain.getFechaInicioMantenimiento());
        entity.setFechaFinMantenimiento(domain.getFechaFinMantenimiento());
        entity.setFechaCierre(domain.getFechaCierre());
        
        entity.setProcessInstanceId(domain.getProcessInstanceId());
        entity.setEstado(domain.getEstado());
        
        return entity;
    }

    public SolicitudMantenimiento toDomain(SolicitudMantenimientoEntity entity) {
        if (entity == null) {
            return null;
        }

        return SolicitudMantenimiento.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .activoId(entity.getActivoId())
                .tipoMantenimientoId(entity.getTipoMantenimientoId())
                .tipoFallaId(entity.getTipoFallaId())
                .prioridadId(entity.getPrioridadId())
                .solicitanteId(entity.getSolicitanteId())
                .titulo(entity.getTitulo())
                .descripcion(entity.getDescripcion())
                .fechaSolicitud(entity.getFechaSolicitud())
                .aprobadorId(entity.getAprobadorId())
                .responsableId(entity.getResponsableId())
                .supervisorId(entity.getSupervisorId())
                .fechaInicioMantenimiento(entity.getFechaInicioMantenimiento())
                .fechaFinMantenimiento(entity.getFechaFinMantenimiento())
                .fechaCierre(entity.getFechaCierre())
                .processInstanceId(entity.getProcessInstanceId())
                .estado(entity.getEstado())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
