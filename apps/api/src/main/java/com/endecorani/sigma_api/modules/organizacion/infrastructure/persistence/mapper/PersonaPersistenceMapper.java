package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.PersonaEntity;
import org.springframework.stereotype.Component;

@Component
public class PersonaPersistenceMapper {

    public PersonaEntity toEntity(Persona domain) {
        if (domain == null) {
            return null;
        }

        PersonaEntity entity = new PersonaEntity();
        entity.setId(domain.getId());
        entity.setTipoDocumento(domain.getTipoDocumento());
        entity.setNumeroDocumento(domain.getNumeroDocumento());
        entity.setComplemento(domain.getComplemento());
        entity.setNombres(domain.getNombres());
        entity.setPrimerApellido(domain.getPrimerApellido());
        entity.setSegundoApellido(domain.getSegundoApellido());
        entity.setFechaNacimiento(domain.getFechaNacimiento());
        entity.setTelefono(domain.getTelefono());
        entity.setCorreo(domain.getCorreo());
        entity.setSistemaOrigen(domain.getSistemaOrigen());
        entity.setCodigoExterno(domain.getCodigoExterno());

        if (domain.getActivo() != null) {
            entity.setActivo(domain.getActivo());
        }
        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public Persona toDomain(PersonaEntity entity) {
        if (entity == null) {
            return null;
        }

        return Persona.builder()
                .id(entity.getId())
                .tipoDocumento(entity.getTipoDocumento())
                .numeroDocumento(entity.getNumeroDocumento())
                .complemento(entity.getComplemento())
                .nombres(entity.getNombres())
                .primerApellido(entity.getPrimerApellido())
                .segundoApellido(entity.getSegundoApellido())
                .fechaNacimiento(entity.getFechaNacimiento())
                .telefono(entity.getTelefono())
                .correo(entity.getCorreo())
                .sistemaOrigen(entity.getSistemaOrigen())
                .codigoExterno(entity.getCodigoExterno())
                .activo(entity.getActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}