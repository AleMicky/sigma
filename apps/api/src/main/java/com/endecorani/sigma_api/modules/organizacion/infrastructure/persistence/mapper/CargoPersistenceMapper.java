package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Cargo;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.CargoEntity;
import org.springframework.stereotype.Component;

@Component
public class CargoPersistenceMapper {

    public CargoEntity toEntity(Cargo domain) {
        if (domain == null) {
            return null;
        }

        CargoEntity entity = new CargoEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setSistemaOrigen(domain.getSistemaOrigen());
        entity.setCodigoExterno(domain.getCodigoExterno());
        return entity;
    }

    public Cargo toDomain(CargoEntity entity) {
        if (entity == null) {
            return null;
        }

        return Cargo.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .sistemaOrigen(entity.getSistemaOrigen())
                .codigoExterno(entity.getCodigoExterno())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}