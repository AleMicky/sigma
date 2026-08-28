package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.parametros.domain.model.Ubicacion;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UbicacionEntity;
import org.springframework.stereotype.Component;

@Component
public class UbicacionPersistenceMapper {

    public UbicacionEntity toEntity(Ubicacion domain) {
        if (domain == null) {
            return null;
        }

        UbicacionEntity entity = new UbicacionEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setTipo(domain.getTipo());
        entity.setDireccion(domain.getDireccion());
        entity.setLatitud(domain.getLatitud());
        entity.setLongitud(domain.getLongitud());

        if (domain.getUbicacionPadreId() != null) {
            UbicacionEntity padre = new UbicacionEntity();
            padre.setId(domain.getUbicacionPadreId());
            entity.setUbicacionPadre(padre);
        }
        return entity;
    }

    public Ubicacion toDomain(UbicacionEntity entity) {
        if (entity == null) {
            return null;
        }

        return Ubicacion.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .tipo(entity.getTipo())
                .ubicacionPadreId(
                        entity.getUbicacionPadre() != null
                                ? entity.getUbicacionPadre().getId()
                                : null
                )
                .direccion(entity.getDireccion())
                .latitud(entity.getLatitud())
                .longitud(entity.getLongitud())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}