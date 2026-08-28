package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDependiente;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorDependienteEntity;
import org.springframework.stereotype.Component;

@Component
public class GrupoAprobadorDependientePersistenceMapper {

    public GrupoAprobadorDependienteEntity toEntity(GrupoAprobadorDependiente domain) {
        if (domain == null) {
            return null;
        }

        GrupoAprobadorDependienteEntity entity = new GrupoAprobadorDependienteEntity();
        entity.setId(domain.getId());
        entity.setGrupoAprobadorId(domain.getGrupoAprobadorId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        return entity;
    }

    public GrupoAprobadorDependiente toDomain(GrupoAprobadorDependienteEntity entity) {
        if (entity == null) {
            return null;
        }

        return GrupoAprobadorDependiente.builder()
                .id(entity.getId())
                .grupoAprobadorId(entity.getGrupoAprobadorId())
                .empleadoId(entity.getEmpleadoId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
