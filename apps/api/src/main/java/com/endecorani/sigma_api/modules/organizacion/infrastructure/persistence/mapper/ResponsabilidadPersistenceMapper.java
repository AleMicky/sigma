package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Responsabilidad;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.ResponsabilidadEntity;
import org.springframework.stereotype.Component;

@Component
public class ResponsabilidadPersistenceMapper {

    public ResponsabilidadEntity toEntity(Responsabilidad domain) {
        if (domain == null) {
            return null;
        }

        ResponsabilidadEntity entity = new ResponsabilidadEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        return entity;
    }

    public Responsabilidad toDomain(ResponsabilidadEntity entity) {
        if (entity == null) {
            return null;
        }

        return Responsabilidad.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
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
