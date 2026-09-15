package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoAplicacionEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class ActividadMantenimientoPersistenceMapper {

    public ActividadMantenimientoEntity toEntity(ActividadMantenimiento domain) {
        if (domain == null) return null;

        ActividadMantenimientoEntity entity = new ActividadMantenimientoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setAplicaTodosTiposActivo(domain.getAplicaTodosTiposActivo() != null ? domain.getAplicaTodosTiposActivo() : false);
        entity.setRequiereChecklist(domain.getRequiereChecklist() != null ? domain.getRequiereChecklist() : false);

        if (domain.getAplicaciones() != null) {
            entity.setAplicaciones(domain.getAplicaciones().stream()
                    .map(this::toAplicacionEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    public ActividadMantenimiento toDomain(ActividadMantenimientoEntity entity) {
        if (entity == null) return null;

        return ActividadMantenimiento.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .aplicaTodosTiposActivo(entity.getAplicaTodosTiposActivo())
                .requiereChecklist(entity.getRequiereChecklist())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .aplicaciones(entity.getAplicaciones() != null ? entity.getAplicaciones().stream()
                        .map(this::toAplicacionDomain)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    public ActividadMantenimientoAplicacionEntity toAplicacionEntity(ActividadMantenimientoAplicacion domain) {
        if (domain == null) return null;

        ActividadMantenimientoAplicacionEntity entity = new ActividadMantenimientoAplicacionEntity();
        entity.setId(domain.getId());
        entity.setActividadMantenimientoId(domain.getActividadMantenimientoId());
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setComponenteId(domain.getComponenteId());
        return entity;
    }

    public ActividadMantenimientoAplicacion toAplicacionDomain(ActividadMantenimientoAplicacionEntity entity) {
        if (entity == null) return null;

        return ActividadMantenimientoAplicacion.builder()
                .id(entity.getId())
                .actividadMantenimientoId(entity.getActividadMantenimientoId())
                .tipoActivoId(entity.getTipoActivoId())
                .componenteId(entity.getComponenteId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
