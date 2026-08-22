package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.EmpleadoResponsabilidad;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoResponsabilidadEntity;
import org.springframework.stereotype.Component;

@Component
public class EmpleadoResponsabilidadPersistenceMapper {

    public EmpleadoResponsabilidadEntity toEntity(EmpleadoResponsabilidad domain) {
        if (domain == null) {
            return null;
        }

        EmpleadoResponsabilidadEntity entity = new EmpleadoResponsabilidadEntity();
        entity.setId(domain.getId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setResponsabilidadId(domain.getResponsabilidadId());
        entity.setFechaInicio(domain.getFechaInicio());
        entity.setFechaFin(domain.getFechaFin());
        return entity;
    }

    public EmpleadoResponsabilidad toDomain(EmpleadoResponsabilidadEntity entity) {
        if (entity == null) {
            return null;
        }

        return EmpleadoResponsabilidad.builder()
                .id(entity.getId())
                .empleadoId(entity.getEmpleadoId())
                .responsabilidadId(entity.getResponsabilidadId())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
