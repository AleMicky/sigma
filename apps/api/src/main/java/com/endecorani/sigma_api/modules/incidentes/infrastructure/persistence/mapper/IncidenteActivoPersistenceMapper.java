package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteActivo;
import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteActivoEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class IncidenteActivoPersistenceMapper {

    private final IncidenteInvolucradoPersistenceMapper involucradoMapper;
    private final IncidenteEvidenciaPersistenceMapper evidenciaMapper;

    public IncidenteActivoEntity toEntity(IncidenteActivo domain) {
        if (domain == null) {
            return null;
        }

        IncidenteActivoEntity entity = new IncidenteActivoEntity();
        entity.setId(domain.getId());
        if (domain.getActivoId() != null) {
            ActivoEntity activo = new ActivoEntity();
            activo.setId(domain.getActivoId());
            entity.setActivo(activo);
        }
        entity.setTipoIncidente(domain.getTipoIncidente());
        entity.setPrioridad(domain.getPrioridad());
        entity.setEstado(domain.getEstado());
        entity.setFechaHora(domain.getFechaHora());
        entity.setUbicacion(domain.getUbicacion());
        entity.setLatitud(domain.getLatitud());
        entity.setLongitud(domain.getLongitud());
        entity.setDescripcion(domain.getDescripcion());
        entity.setEmpleadoReportaId(domain.getEmpleadoReportaId());
        entity.setProcessInstanceId(domain.getProcessInstanceId());
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setCreatedById(domain.getCreatedById());
        entity.setUpdatedById(domain.getUpdatedById());

        if (domain.getInvolucrados() != null) {
            entity.setInvolucrados(
                    domain.getInvolucrados().stream()
                            .map(involucradoMapper::toEntity)
                            .collect(Collectors.toCollection(ArrayList::new))
            );
        }
        if (domain.getEvidencias() != null) {
            entity.setEvidencias(
                    domain.getEvidencias().stream()
                            .map(evidenciaMapper::toEntity)
                            .collect(Collectors.toCollection(ArrayList::new))
            );
        }

        return entity;
    }

    public void updateEntity(IncidenteActivo domain, IncidenteActivoEntity entity) {
        if (domain == null || entity == null) {
            return;
        }
        if (domain.getActivoId() != null) {
            ActivoEntity activo = new ActivoEntity();
            activo.setId(domain.getActivoId());
            entity.setActivo(activo);
        }
        entity.setTipoIncidente(domain.getTipoIncidente());
        entity.setPrioridad(domain.getPrioridad());
        entity.setEstado(domain.getEstado());
        entity.setFechaHora(domain.getFechaHora());
        entity.setUbicacion(domain.getUbicacion());
        entity.setLatitud(domain.getLatitud());
        entity.setLongitud(domain.getLongitud());
        entity.setDescripcion(domain.getDescripcion());
        entity.setEmpleadoReportaId(domain.getEmpleadoReportaId());
        entity.setProcessInstanceId(domain.getProcessInstanceId());
    }

    public IncidenteActivo toDomain(IncidenteActivoEntity entity) {
        if (entity == null) {
            return null;
        }

        return IncidenteActivo.builder()
                .id(entity.getId())
                .activoId(entity.getActivo() != null ? entity.getActivo().getId() : null)
                .tipoIncidente(entity.getTipoIncidente())
                .prioridad(entity.getPrioridad())
                .estado(entity.getEstado())
                .fechaHora(entity.getFechaHora())
                .ubicacion(entity.getUbicacion())
                .latitud(entity.getLatitud())
                .longitud(entity.getLongitud())
                .descripcion(entity.getDescripcion())
                .empleadoReportaId(entity.getEmpleadoReportaId())
                .processInstanceId(entity.getProcessInstanceId())
                .involucrados(entity.getInvolucrados() != null
                        ? entity.getInvolucrados().stream().map(involucradoMapper::toDomain).toList()
                        : new ArrayList<>())
                .evidencias(entity.getEvidencias() != null
                        ? entity.getEvidencias().stream().map(evidenciaMapper::toDomain).toList()
                        : new ArrayList<>())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}

