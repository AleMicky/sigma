package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class PlanMantenimientoPersistenceMapper {

    public PlanMantenimientoEntity toEntity(PlanMantenimiento domain) {
        if (domain == null) {
            return null;
        }

        PlanMantenimientoEntity entity = new PlanMantenimientoEntity();
        entity.setId(domain.getId());
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setTipoMantenimientoId(domain.getTipoMantenimientoId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setEstado(domain.getEstado() != null
                ? domain.getEstado()
                : com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento.ACTIVO);
        entity.setCriterioDefaultTipo(domain.getCriterioDefaultTipo());
        entity.setCriterioDefaultDias(domain.getCriterioDefaultDias());
        entity.setCriterioDefaultUso(domain.getCriterioDefaultUso());
        return entity;
    }

    public PlanMantenimiento toDomain(PlanMantenimientoEntity entity) {
        if (entity == null) {
            return null;
        }

        return PlanMantenimiento.builder()
                .id(entity.getId())
                .tipoActivoId(entity.getTipoActivoId())
                .tipoMantenimientoId(entity.getTipoMantenimientoId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .estado(entity.getEstado())
                .criterioDefaultTipo(entity.getCriterioDefaultTipo())
                .criterioDefaultDias(entity.getCriterioDefaultDias())
                .criterioDefaultUso(entity.getCriterioDefaultUso())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
