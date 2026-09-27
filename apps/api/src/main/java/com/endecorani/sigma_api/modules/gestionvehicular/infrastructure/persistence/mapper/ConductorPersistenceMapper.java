package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ConductorLicencia;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ConductorPersistenceMapper {

    public ConductorEntity toEntity(Conductor domain) {
        if (domain == null) {
            return null;
        }

        List<ConductorLicenciaEntity> licenciaEntities = new ArrayList<>();
        if (domain.getLicencias() != null) {
            for (ConductorLicencia lic : domain.getLicencias()) {
                licenciaEntities.add(licenciaToEntity(lic));
            }
        }

        ConductorEntity entity = new ConductorEntity();
        entity.setId(domain.getId());
        entity.setEmpleadoId(domain.getEmpleadoId());
        entity.setEstado(domain.getEstado());
        entity.setObservacion(domain.getObservacion());
        entity.setActivo(domain.isActivo());
        entity.setLicencias(licenciaEntities);
        return entity;
    }

    public Conductor toDomain(ConductorEntity entity) {
        if (entity == null) {
            return null;
        }

        List<ConductorLicencia> licencias = new ArrayList<>();
        if (entity.getLicencias() != null) {
            for (ConductorLicenciaEntity licEntity : entity.getLicencias()) {
                licencias.add(licenciaToDomain(licEntity));
            }
        }

        return Conductor.builder()
                .id(entity.getId())
                .empleadoId(entity.getEmpleadoId())
                .estado(entity.getEstado())
                .observacion(entity.getObservacion())
                .licencias(licencias)
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }

    public ConductorLicenciaEntity licenciaToEntity(ConductorLicencia domain) {
        if (domain == null) {
            return null;
        }

        ConductorLicenciaEntity entity = new ConductorLicenciaEntity();
        entity.setId(domain.getId());
        entity.setCategoriaLicencia(domain.getCategoriaLicencia());
        entity.setNumeroLicencia(domain.getNumeroLicencia());
        entity.setFechaEmision(domain.getFechaEmision());
        entity.setFechaVencimiento(domain.getFechaVencimiento());
        entity.setEstado(domain.getEstado());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setNombreOriginal(domain.getNombreOriginal());
        entity.setUrl(domain.getUrl());
        entity.setMimeType(domain.getMimeType());
        entity.setSize(domain.getSize());
        entity.setObservacion(domain.getObservacion());
        entity.setActivo(domain.isActivo());
        return entity;
    }

    public ConductorLicencia licenciaToDomain(ConductorLicenciaEntity entity) {
        if (entity == null) {
            return null;
        }

        return ConductorLicencia.builder()
                .id(entity.getId())
                .conductorId(entity.getConductorId())
                .categoriaLicencia(entity.getCategoriaLicencia())
                .numeroLicencia(entity.getNumeroLicencia())
                .fechaEmision(entity.getFechaEmision())
                .fechaVencimiento(entity.getFechaVencimiento())
                .estado(entity.getEstado())
                .nombreArchivo(entity.getNombreArchivo())
                .nombreOriginal(entity.getNombreOriginal())
                .url(entity.getUrl())
                .mimeType(entity.getMimeType())
                .size(entity.getSize())
                .observacion(entity.getObservacion())
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
