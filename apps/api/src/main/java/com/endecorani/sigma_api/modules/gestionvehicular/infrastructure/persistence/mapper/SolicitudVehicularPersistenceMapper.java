package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity;
import org.springframework.stereotype.Component;

@Component
public class SolicitudVehicularPersistenceMapper {

    public SolicitudVehicularEntity toEntity(SolicitudVehicular domain) {
        if (domain == null) {
            return null;
        }

        SolicitudVehicularEntity entity = new SolicitudVehicularEntity();
        entity.setId(domain.getId());
        entity.setNumero(domain.getNumero());
        entity.setTipoSolicitudVehicularId(domain.getTipoSolicitudVehicularId());
        entity.setSolicitanteId(domain.getSolicitanteId());
        entity.setMotivo(domain.getMotivo());
        entity.setJustificacion(domain.getJustificacion());
        entity.setDestino(domain.getDestino());
        entity.setFechaSalida(domain.getFechaSalida());
        entity.setFechaRetornoEstimada(domain.getFechaRetornoEstimada());
        entity.setCantidadPasajeros(domain.getCantidadPasajeros());
        entity.setObservacion(domain.getObservacion());
        entity.setEstado(domain.getEstado());
        entity.setProcessInstanceId(domain.getProcessInstanceId());
        return entity;
    }

    public SolicitudVehicular toDomain(SolicitudVehicularEntity entity) {
        if (entity == null) {
            return null;
        }

        return SolicitudVehicular.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .tipoSolicitudVehicularId(entity.getTipoSolicitudVehicularId())
                .solicitanteId(entity.getSolicitanteId())
                .motivo(entity.getMotivo())
                .justificacion(entity.getJustificacion())
                .destino(entity.getDestino())
                .fechaSalida(entity.getFechaSalida())
                .fechaRetornoEstimada(entity.getFechaRetornoEstimada())
                .cantidadPasajeros(entity.getCantidadPasajeros())
                .observacion(entity.getObservacion())
                .estado(entity.getEstado())
                .processInstanceId(entity.getProcessInstanceId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
