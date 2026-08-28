package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.GrupoAprobadorDetalle;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorDetalleEntity;
import org.springframework.stereotype.Component;

@Component
public class GrupoAprobadorDetallePersistenceMapper {

    public GrupoAprobadorDetalleEntity toEntity(GrupoAprobadorDetalle domain) {
        if (domain == null) {
            return null;
        }

        GrupoAprobadorDetalleEntity entity = new GrupoAprobadorDetalleEntity();
        entity.setId(domain.getId());
        entity.setGrupoAprobadorId(domain.getGrupoAprobadorId());
        entity.setTipoAprobador(domain.getTipoAprobador());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setCargoId(domain.getCargoId());
        entity.setResponsabilidadId(domain.getResponsabilidadId());
        entity.setOrden(domain.getOrden());
        entity.setRequiereAprobacion(domain.getRequiereAprobacion());
        return entity;
    }

    public GrupoAprobadorDetalle toDomain(GrupoAprobadorDetalleEntity entity) {
        if (entity == null) {
            return null;
        }

        return GrupoAprobadorDetalle.builder()
                .id(entity.getId())
                .grupoAprobadorId(entity.getGrupoAprobadorId())
                .tipoAprobador(entity.getTipoAprobador())
                .empleadoId(entity.getEmpleadoId())
                .cargoId(entity.getCargoId())
                .responsabilidadId(entity.getResponsabilidadId())
                .orden(entity.getOrden())
                .requiereAprobacion(entity.getRequiereAprobacion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
