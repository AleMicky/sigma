package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobador;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorEntity;
import org.springframework.stereotype.Component;

@Component
public class GrupoAprobadorPersistenceMapper {

    public GrupoAprobadorEntity toEntity(GrupoAprobador domain) {
        if (domain == null) {
            return null;
        }

        GrupoAprobadorEntity entity = new GrupoAprobadorEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        return entity;
    }

    public GrupoAprobador toDomain(GrupoAprobadorEntity entity) {
        if (entity == null) {
            return null;
        }

        return GrupoAprobador.builder()
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
