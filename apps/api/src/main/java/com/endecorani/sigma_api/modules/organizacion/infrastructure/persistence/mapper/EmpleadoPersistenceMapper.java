package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import org.springframework.stereotype.Component;

@Component
public class EmpleadoPersistenceMapper {

    public EmpleadoEntity toEntity(Empleado domain) {
        if (domain == null) {
            return null;
        }

        EmpleadoEntity entity = new EmpleadoEntity();
        entity.setId(domain.getId());
        entity.setPersonaId(domain.getPersonaId());
        entity.setAreaId(domain.getAreaId());
        entity.setCargoId(domain.getCargoId());
        entity.setCodigo(domain.getCodigo());
        entity.setFechaInicio(domain.getFechaInicio());
        entity.setFechaFin(domain.getFechaFin());
        entity.setSistemaOrigen(domain.getSistemaOrigen());
        entity.setCodigoExterno(domain.getCodigoExterno());

        if (domain.getActivo() != null) {
            entity.setActivo(domain.getActivo());
        }
        return entity;
    }

    public Empleado toDomain(EmpleadoEntity entity) {
        if (entity == null) {
            return null;
        }

        return Empleado.builder()
                .id(entity.getId())
                .personaId(entity.getPersonaId())
                .areaId(entity.getAreaId())
                .cargoId(entity.getCargoId())
                .codigo(entity.getCodigo())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .sistemaOrigen(entity.getSistemaOrigen())
                .codigoExterno(entity.getCodigoExterno())
                .activo(entity.getActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}