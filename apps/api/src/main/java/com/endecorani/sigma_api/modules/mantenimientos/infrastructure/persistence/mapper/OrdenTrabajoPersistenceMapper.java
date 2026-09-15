package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEvidenciaEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoAdjuntoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class OrdenTrabajoPersistenceMapper {

    public OrdenTrabajoEntity toEntity(OrdenTrabajo domain) {
        if (domain == null) return null;

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

        if (domain.getActividades() != null) {
            entity.setActividades(domain.getActividades().stream()
                    .map(this::toActividadEntity)
                    .collect(Collectors.toList()));
        }

        if (domain.getAdjuntos() != null) {
            entity.setAdjuntos(domain.getAdjuntos().stream()
                    .map(this::toAdjuntoEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    public OrdenTrabajo toDomain(OrdenTrabajoEntity entity) {
        if (entity == null) return null;

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
                .actividades(entity.getActividades() != null ? entity.getActividades().stream()
                        .map(this::toActividadDomain)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .adjuntos(entity.getAdjuntos() != null ? entity.getAdjuntos().stream()
                        .map(this::toAdjuntoDomain)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public OrdenTrabajoActividadEntity toActividadEntity(OrdenTrabajoActividad domain) {
        if (domain == null) return null;

        OrdenTrabajoActividadEntity entity = new OrdenTrabajoActividadEntity();
        entity.setId(domain.getId());
        entity.setOrdenTrabajoId(domain.getOrdenTrabajoId());
        entity.setActividadMantenimientoId(domain.getActividadMantenimientoId());
        entity.setDescripcion(domain.getDescripcion());
        entity.setRealizado(domain.isRealizado());
        entity.setObservacion(domain.getObservacion());
        entity.setFechaRealizacion(domain.getFechaRealizacion());

        if (domain.getEvidencias() != null) {
            entity.setEvidencias(domain.getEvidencias().stream()
                    .map(this::toEvidenciaEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    public OrdenTrabajoActividad toActividadDomain(OrdenTrabajoActividadEntity entity) {
        if (entity == null) return null;

        return OrdenTrabajoActividad.builder()
                .id(entity.getId())
                .ordenTrabajoId(entity.getOrdenTrabajoId())
                .actividadMantenimientoId(entity.getActividadMantenimientoId())
                .descripcion(entity.getDescripcion())
                .realizado(entity.isRealizado())
                .observacion(entity.getObservacion())
                .fechaRealizacion(entity.getFechaRealizacion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .evidencias(entity.getEvidencias() != null ? entity.getEvidencias().stream()
                        .map(this::toEvidenciaDomain)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public OrdenTrabajoActividadEvidenciaEntity toEvidenciaEntity(OrdenTrabajoActividadEvidencia domain) {
        if (domain == null) return null;

        OrdenTrabajoActividadEvidenciaEntity entity = new OrdenTrabajoActividadEvidenciaEntity();
        entity.setId(domain.getId());
        entity.setOrdenTrabajoActividadId(domain.getOrdenTrabajoActividadId());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setTipoMime(domain.getTipoMime());
        entity.setTamanio(domain.getTamanio());
        entity.setUrl(domain.getUrl());
        return entity;
    }

    public OrdenTrabajoActividadEvidencia toEvidenciaDomain(OrdenTrabajoActividadEvidenciaEntity entity) {
        if (entity == null) return null;

        return OrdenTrabajoActividadEvidencia.builder()
                .id(entity.getId())
                .ordenTrabajoActividadId(entity.getOrdenTrabajoActividadId())
                .nombreArchivo(entity.getNombreArchivo())
                .tipoMime(entity.getTipoMime())
                .tamanio(entity.getTamanio())
                .url(entity.getUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }

    public OrdenTrabajoAdjuntoEntity toAdjuntoEntity(OrdenTrabajoAdjunto domain) {
        if (domain == null) return null;

        OrdenTrabajoAdjuntoEntity entity = new OrdenTrabajoAdjuntoEntity();
        entity.setId(domain.getId());
        entity.setOrdenTrabajoId(domain.getOrdenTrabajoId());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setTipoMime(domain.getTipoMime());
        entity.setTamanio(domain.getTamanio());
        entity.setUrl(domain.getUrl());
        entity.setDescripcion(domain.getDescripcion());
        return entity;
    }

    public OrdenTrabajoAdjunto toAdjuntoDomain(OrdenTrabajoAdjuntoEntity entity) {
        if (entity == null) return null;

        return OrdenTrabajoAdjunto.builder()
                .id(entity.getId())
                .ordenTrabajoId(entity.getOrdenTrabajoId())
                .nombreArchivo(entity.getNombreArchivo())
                .tipoMime(entity.getTipoMime())
                .tamanio(entity.getTamanio())
                .url(entity.getUrl())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
