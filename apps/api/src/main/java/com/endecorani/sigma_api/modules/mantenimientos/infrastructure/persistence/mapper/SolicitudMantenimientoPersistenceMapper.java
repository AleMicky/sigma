package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class SolicitudMantenimientoPersistenceMapper {

    public SolicitudMantenimientoEntity toEntity(
            SolicitudMantenimiento domain
    ) {
        if (domain == null) {
            return null;
        }

        SolicitudMantenimientoEntity entity =
                new SolicitudMantenimientoEntity();

        entity.setId(domain.getId());
        entity.setNumero(domain.getNumero());
        entity.setActivoId(domain.getActivoId());
        entity.setTipoMantenimientoId(domain.getTipoMantenimientoId());
        entity.setTipoFallas(domain.getTipoFallas());
        entity.setPrioridadId(domain.getPrioridadId());
        entity.setSolicitanteId(domain.getSolicitanteId());
        entity.setTitulo(domain.getTitulo());
        entity.setDescripcion(domain.getDescripcion());
        entity.setFechaSolicitud(domain.getFechaSolicitud());
        entity.setAprobadoPorId(domain.getAprobadoPorId());
        entity.setFechaAprobacion(domain.getFechaAprobacion());
        entity.setFechaEstimadaOt(domain.getFechaEstimadaOt());
        entity.setObservacionAprobacion(domain.getObservacionAprobacion());
        entity.setResponsableId(domain.getResponsableId());
        entity.setFechaAsignacion(domain.getFechaAsignacion());
        entity.setFechaInicioMantenimiento(
                domain.getFechaInicioMantenimiento()
        );
        entity.setFechaFinMantenimiento(
                domain.getFechaFinMantenimiento()
        );
        entity.setSupervisorId(domain.getSupervisorId());
        entity.setFechaValidacion(domain.getFechaValidacion());
        entity.setObservacionValidacion(domain.getObservacionValidacion());
        entity.setFechaFinalizacion(domain.getFechaFinalizacion());
        entity.setRecibidoPorId(domain.getRecibidoPorId());
        entity.setObservacionCierre(domain.getObservacionCierre());
        entity.setEstado(domain.getEstado());
        entity.setProcessInstanceId(domain.getProcessInstanceId());

        return entity;
    }

    public SolicitudMantenimiento toDomain(
            SolicitudMantenimientoEntity entity
    ) {
        if (entity == null) {
            return null;
        }

        return SolicitudMantenimiento.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .activoId(entity.getActivoId())
                .tipoMantenimientoId(entity.getTipoMantenimientoId())
                .tipoFallas(
                        entity.getTipoFallas()
                )
                .prioridadId(entity.getPrioridadId())
                .solicitanteId(entity.getSolicitanteId())
                .titulo(entity.getTitulo())
                .descripcion(entity.getDescripcion())
                .fechaSolicitud(entity.getFechaSolicitud())
                .aprobadoPorId(entity.getAprobadoPorId())
                .fechaAprobacion(entity.getFechaAprobacion())
                .fechaEstimadaOt(entity.getFechaEstimadaOt())
                .observacionAprobacion(
                        entity.getObservacionAprobacion()
                )
                .responsableId(entity.getResponsableId())
                .fechaAsignacion(entity.getFechaAsignacion())
                .fechaInicioMantenimiento(
                        entity.getFechaInicioMantenimiento()
                )
                .fechaFinMantenimiento(
                        entity.getFechaFinMantenimiento()
                )
                .supervisorId(entity.getSupervisorId())
                .fechaValidacion(entity.getFechaValidacion())
                .observacionValidacion(
                        entity.getObservacionValidacion()
                )
                .fechaFinalizacion(entity.getFechaFinalizacion())
                .recibidoPorId(entity.getRecibidoPorId())
                .observacionCierre(entity.getObservacionCierre())
                .estado(entity.getEstado())
                .processInstanceId(entity.getProcessInstanceId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
