package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import org.springframework.stereotype.Component;

@Component
public class AccesorioPersistenceMapper {

    public AccesorioEntity toEntity(Accesorio domain) {
        if (domain == null) {
            return null;
        }

        AccesorioEntity entity = new AccesorioEntity();
        entity.setId(domain.getId());
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());

        return entity;
    }

    public Accesorio toDomain(AccesorioEntity entity) {
        if (entity == null) {
            return null;
        }

        return Accesorio.builder()
                .id(entity.getId())
                .tipoActivoId(entity.getTipoActivoId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
