package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteriaActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.RegistroPorteriaActivoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.RegistroPorteriaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RegistroPorteriaPersistenceMapper {

    public RegistroPorteria toDomain(RegistroPorteriaEntity entity) {
        if (entity == null) {
            return null;
        }
        List<RegistroPorteriaActivo> activos = entity.getActivos() == null
                ? new ArrayList<>()
                : entity.getActivos().stream()
                        .map(this::toActivoDomain)
                        .toList();

        return RegistroPorteria.builder()
                .id(entity.getId())
                .numero(entity.getNumero())
                .empleadoId(entity.getEmpleadoId())
                .esExterno(entity.getEsExterno())
                .personaExterna(entity.getPersonaExterna())
                .placaExterna(entity.getPlacaExterna())
                .guardiaSalidaId(entity.getGuardiaSalidaId())
                .guardiaLlegadaId(entity.getGuardiaLlegadaId())
                .salidaVehicularId(entity.getSalidaVehicularId())
                .fechaHoraSalida(entity.getFechaHoraSalida())
                .fechaHoraLlegada(entity.getFechaHoraLlegada())
                .estado(entity.getEstado())
                .observacionSalida(entity.getObservacionSalida())
                .observacionLlegada(entity.getObservacionLlegada())
                .activos(new ArrayList<>(activos))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }

    public RegistroPorteriaEntity toEntity(RegistroPorteria domain) {
        if (domain == null) {
            return null;
        }
        RegistroPorteriaEntity entity = RegistroPorteriaEntity.builder()
                .id(domain.getId())
                .numero(domain.getNumero())
                .empleadoId(domain.getEmpleadoId())
                .esExterno(Boolean.TRUE.equals(domain.getEsExterno()))
                .personaExterna(domain.getPersonaExterna())
                .placaExterna(domain.getPlacaExterna())
                .guardiaSalidaId(domain.getGuardiaSalidaId())
                .guardiaLlegadaId(domain.getGuardiaLlegadaId())
                .salidaVehicularId(domain.getSalidaVehicularId())
                .fechaHoraSalida(domain.getFechaHoraSalida())
                .fechaHoraLlegada(domain.getFechaHoraLlegada())
                .estado(domain.getEstado())
                .observacionSalida(domain.getObservacionSalida())
                .observacionLlegada(domain.getObservacionLlegada())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .createdBy(domain.getCreatedBy())
                .updatedBy(domain.getUpdatedBy())
                .createdById(domain.getCreatedById())
                .updatedById(domain.getUpdatedById())
                .build();

        List<RegistroPorteriaActivoEntity> activoEntities = new ArrayList<>();
        if (domain.getActivos() != null) {
            for (RegistroPorteriaActivo item : domain.getActivos()) {
                RegistroPorteriaActivoEntity itemEntity = toActivoEntity(item, entity);
                activoEntities.add(itemEntity);
            }
        }
        entity.setActivos(activoEntities);
        return entity;
    }

    private RegistroPorteriaActivo toActivoDomain(RegistroPorteriaActivoEntity entity) {
        return RegistroPorteriaActivo.builder()
                .id(entity.getId())
                .registroPorteriaId(entity.getRegistroPorteriaId())
                .activoId(entity.getActivoId())
                .descripcionItem(entity.getDescripcionItem())
                .cantidad(entity.getCantidad())
                .observacionSalida(entity.getObservacionSalida())
                .retornado(entity.getRetornado())
                .observacionLlegada(entity.getObservacionLlegada())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }

    private RegistroPorteriaActivoEntity toActivoEntity(RegistroPorteriaActivo domain, RegistroPorteriaEntity parent) {
        return RegistroPorteriaActivoEntity.builder()
                .id(domain.getId())
                .registroPorteria(parent)
                .registroPorteriaId(parent.getId())
                .activoId(domain.getActivoId())
                .descripcionItem(domain.getDescripcionItem())
                .cantidad(domain.getCantidad() != null ? domain.getCantidad() : 1)
                .observacionSalida(domain.getObservacionSalida())
                .retornado(domain.getRetornado())
                .observacionLlegada(domain.getObservacionLlegada())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .createdBy(domain.getCreatedBy())
                .updatedBy(domain.getUpdatedBy())
                .createdById(domain.getCreatedById())
                .updatedById(domain.getUpdatedById())
                .build();
    }
}

