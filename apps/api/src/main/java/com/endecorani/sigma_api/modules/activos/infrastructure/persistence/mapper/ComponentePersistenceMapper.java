package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.Componente;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ComponenteEntity;
import org.springframework.stereotype.Component;

@Component
public class ComponentePersistenceMapper {

    public ComponenteEntity toEntity(Componente domain) {
        if (domain == null) {
            return null;
        }

        ComponenteEntity entity = new ComponenteEntity();
        entity.setId(domain.getId());
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setActivo(domain.getActivo());

        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public Componente toDomain(ComponenteEntity entity) {
        if (entity == null) {
            return null;
        }

        return Componente.builder()
                .id(entity.getId())
                .tipoActivoId(entity.getTipoActivoId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .activo(entity.getActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
