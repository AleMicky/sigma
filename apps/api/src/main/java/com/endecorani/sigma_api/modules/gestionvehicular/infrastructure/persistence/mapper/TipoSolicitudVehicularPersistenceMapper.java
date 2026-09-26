package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoSolicitudVehicularPersistenceMapper {

    public TipoSolicitudVehicularEntity toEntity(TipoSolicitudVehicular domain) {
        if (domain == null) {
            return null;
        }

        TipoSolicitudVehicularEntity entity = new TipoSolicitudVehicularEntity();
        entity.setId(domain.getId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setDiasAnticipacion(domain.getDiasAnticipacion());
        entity.setRequiereJustificacion(domain.getRequiereJustificacion());
        entity.setRequiereRespaldo(domain.getRequiereRespaldo());
        return entity;
    }

    public TipoSolicitudVehicular toDomain(TipoSolicitudVehicularEntity entity) {
        if (entity == null) {
            return null;
        }

        return TipoSolicitudVehicular.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .diasAnticipacion(entity.getDiasAnticipacion())
                .requiereJustificacion(entity.getRequiereJustificacion())
                .requiereRespaldo(entity.getRequiereRespaldo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}

