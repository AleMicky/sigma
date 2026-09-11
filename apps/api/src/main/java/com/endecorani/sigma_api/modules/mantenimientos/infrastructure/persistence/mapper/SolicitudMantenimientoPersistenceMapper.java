package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoAdjuntoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class SolicitudMantenimientoPersistenceMapper {

    public SolicitudMantenimientoEntity toEntity(SolicitudMantenimiento domain) {
        if (domain == null) return null;

        SolicitudMantenimientoEntity entity = new SolicitudMantenimientoEntity();
        entity.setId(domain.getId());
        entity.setNumero(domain.getNumero());
        
        entity.setActivo(toActivoEntity(domain.getActivo()));
        entity.setTipoMantenimiento(toTipoMantenimientoEntity(domain.getTipoMantenimiento()));
        entity.setTipoFallas(domain.getTipoFallas());
        entity.setPrioridad(toPrioridadEntity(domain.getPrioridad()));
        
        entity.setSolicitante(toEmpleadoEntity(domain.getSolicitante()));
        entity.setTitulo(domain.getTitulo());
        entity.setDescripcion(domain.getDescripcion());
        entity.setFechaSolicitud(domain.getFechaSolicitud());
        
        entity.setAprobador(toEmpleadoEntity(domain.getAprobador()));
        entity.setResponsable(toEmpleadoEntity(domain.getResponsable()));
        entity.setSupervisor(toEmpleadoEntity(domain.getSupervisor()));
        
        entity.setFechaInicioMantenimiento(domain.getFechaInicioMantenimiento());
        entity.setFechaFinMantenimiento(domain.getFechaFinMantenimiento());
        entity.setFechaCierre(domain.getFechaCierre());
        
        entity.setProcessInstanceId(domain.getProcessInstanceId());
        entity.setEstado(domain.getEstado());

        if (domain.getAdjuntos() != null) {
            entity.setAdjuntos(domain.getAdjuntos().stream()
                    .map(this::toAdjuntoEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    public SolicitudMantenimiento toDomain(SolicitudMantenimientoEntity entity) {
        if (entity == null) return null;

        return SolicitudMantenimiento.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .activo(toActivoDomain(entity.getActivo()))
                .tipoMantenimiento(toTipoMantenimientoDomain(entity.getTipoMantenimiento()))
                .tipoFallas(entity.getTipoFallas())
                .prioridad(toPrioridadDomain(entity.getPrioridad()))
                .solicitante(toEmpleadoDomain(entity.getSolicitante()))
                .titulo(entity.getTitulo())
                .descripcion(entity.getDescripcion())
                .fechaSolicitud(entity.getFechaSolicitud())
                .aprobador(toEmpleadoDomain(entity.getAprobador()))
                .responsable(toEmpleadoDomain(entity.getResponsable()))
                .supervisor(toEmpleadoDomain(entity.getSupervisor()))
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
                .adjuntos(entity.getAdjuntos() != null ? entity.getAdjuntos().stream()
                        .map(this::toAdjuntoDomain)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    private ActivoEntity toActivoEntity(Activo domain) {
        if (domain == null || domain.getId() == null) return null;
        ActivoEntity entity = new ActivoEntity();
        entity.setId(domain.getId());
        return entity;
    }

    private Activo toActivoDomain(ActivoEntity entity) {
        if (entity == null) return null;
        return Activo.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .build();
    }

    private TipoMantenimientoEntity toTipoMantenimientoEntity(TipoMantenimiento domain) {
        if (domain == null || domain.getId() == null) return null;
        TipoMantenimientoEntity entity = new TipoMantenimientoEntity();
        entity.setId(domain.getId());
        return entity;
    }

    private TipoMantenimiento toTipoMantenimientoDomain(TipoMantenimientoEntity entity) {
        if (entity == null) return null;
        return TipoMantenimiento.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .build();
    }

    private PrioridadEntity toPrioridadEntity(Prioridad domain) {
        if (domain == null || domain.getId() == null) return null;
        PrioridadEntity entity = new PrioridadEntity();
        entity.setId(domain.getId());
        return entity;
    }

    private Prioridad toPrioridadDomain(PrioridadEntity entity) {
        if (entity == null) return null;
        return Prioridad.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .nivel(entity.getNivel())
                .build();
    }

    private EmpleadoEntity toEmpleadoEntity(Empleado domain) {
        if (domain == null || domain.getId() == null) return null;
        EmpleadoEntity entity = new EmpleadoEntity();
        entity.setId(domain.getId());
        return entity;
    }

    private Empleado toEmpleadoDomain(EmpleadoEntity entity) {
        if (entity == null) return null;
        return Empleado.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .build();
    }

    private SolicitudMantenimientoAdjuntoEntity toAdjuntoEntity(SolicitudMantenimientoAdjunto domain) {
        if (domain == null) return null;
        SolicitudMantenimientoAdjuntoEntity entity = new SolicitudMantenimientoAdjuntoEntity();
        entity.setId(domain.getId());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setUrl(domain.getUrl());
        entity.setTipoContenido(domain.getTipoContenido());
        entity.setSize(domain.getSize());
        entity.setDescripcion(domain.getDescripcion());
        entity.setSolicitudMantenimientoId(domain.getSolicitudMantenimientoId());
        return entity;
    }

    private SolicitudMantenimientoAdjunto toAdjuntoDomain(SolicitudMantenimientoAdjuntoEntity entity) {
        if (entity == null) return null;
        return SolicitudMantenimientoAdjunto.builder()
                .id(entity.getId())
                .nombreArchivo(entity.getNombreArchivo())
                .url(entity.getUrl())
                .tipoContenido(entity.getTipoContenido())
                .size(entity.getSize())
                .descripcion(entity.getDescripcion())
                .solicitudMantenimientoId(entity.getSolicitudMantenimientoId())
                .build();
    }
}
