package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import org.springframework.stereotype.Component;

@Component
public class ActivoPersistenceMapper {

    public ActivoEntity toEntity(Activo domain) {
        if (domain == null) {
            return null;
        }

        ActivoEntity entity = new ActivoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setUbicacionId(domain.getUbicacionId());
        entity.setFechaAdquisicion(domain.getFechaAdquisicion());
        entity.setUrlImagen(domain.getUrlImagen());
        entity.setActivo(domain.getActivo());

        return entity;
    }

    public Activo toDomain(ActivoEntity entity) {
        if (entity == null) {
            return null;
        }

        return Activo.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .tipoActivoId(entity.getTipoActivoId())
                .ubicacionId(entity.getUbicacionId())
                .fechaAdquisicion(entity.getFechaAdquisicion())
                .urlImagen(entity.getUrlImagen())
                .activo(entity.getActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
