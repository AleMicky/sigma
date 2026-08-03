package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.Documentos;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.DocumentosEntity;
import org.springframework.stereotype.Component;

@Component
public class DocumentosPersistenceMapper {

    public DocumentosEntity toEntity(Documentos domain) {
        if (domain == null) {
            return null;
        }

        DocumentosEntity entity = new DocumentosEntity();
        entity.setId(domain.getId());
        entity.setActivoId(domain.getActivoId());
        entity.setTipoDocumentoId(domain.getTipoDocumentoId());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setNombreOriginal(domain.getNombreOriginal());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setRuta(domain.getRuta());
        entity.setExtension(domain.getExtension());
        entity.setMimeType(domain.getMimeType());
        entity.setTamanoBytes(domain.getTamanoBytes());
        entity.setFechaDocumento(domain.getFechaDocumento());
        entity.setFechaVencimiento(domain.getFechaVencimiento());

        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public Documentos toDomain(DocumentosEntity entity) {
        if (entity == null) {
            return null;
        }

        return Documentos.builder()
                .id(entity.getId())
                .activoId(entity.getActivoId())
                .tipoDocumentoId(entity.getTipoDocumentoId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .nombreOriginal(entity.getNombreOriginal())
                .nombreArchivo(entity.getNombreArchivo())
                .ruta(entity.getRuta())
                .extension(entity.getExtension())
                .mimeType(entity.getMimeType())
                .tamanoBytes(entity.getTamanoBytes())
                .fechaDocumento(entity.getFechaDocumento())
                .fechaVencimiento(entity.getFechaVencimiento())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}