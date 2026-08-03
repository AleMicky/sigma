package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.RegistroMigracion;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.RegistroMigracionEntity;
import org.springframework.stereotype.Component;

@Component
public class RegistroMigracionPersistenceMapper {

    public RegistroMigracion toDomain(RegistroMigracionEntity entity) {
        if (entity == null) {
            return null;
        }

        return RegistroMigracion.builder()
                .id(entity.getId())
                .sistemaOrigen(entity.getSistemaOrigen())
                .entidad(entity.getEntidad())
                .idOrigen(entity.getIdOrigen())
                .idDestino(entity.getIdDestino())
                .estado(entity.getEstado())
                .mensaje(entity.getMensaje())
                .fechaRegistro(entity.getFechaRegistro())
                .build();
    }
}