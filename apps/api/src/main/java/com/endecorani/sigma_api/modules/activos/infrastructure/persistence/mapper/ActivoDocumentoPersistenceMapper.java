package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoDocumento;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoDocumentoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TiposDocumentoEntity;
import org.springframework.stereotype.Component;

@Component
public class ActivoDocumentoPersistenceMapper {

    public ActivoDocumentoEntity toEntity(ActivoDocumento domain) {
        if (domain == null) {
            return null;
        }

        ActivoDocumentoEntity entity = new ActivoDocumentoEntity();
        entity.setId(domain.getId());

        if (domain.getActivoId() != null) {
            ActivoEntity activo = new ActivoEntity();
            activo.setId(domain.getActivoId());
            entity.setActivo(activo);
        }

        if (domain.getTipoDocumentoId() != null) {
            TiposDocumentoEntity tipoDocumento = new TiposDocumentoEntity();
            tipoDocumento.setId(domain.getTipoDocumentoId());
            entity.setTipoDocumento(tipoDocumento);
        }

        entity.setNumeroDocumento(domain.getNumeroDocumento());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setFechaEmision(domain.getFechaEmision());
        entity.setFechaVencimiento(domain.getFechaVencimiento());
        entity.setNombreArchivo(domain.getNombreArchivo());
        entity.setRutaArchivo(domain.getRutaArchivo());
        entity.setMimeType(domain.getMimeType());
        entity.setSize(domain.getSize());

        return entity;
    }

    public ActivoDocumento toDomain(ActivoDocumentoEntity entity) {
        if (entity == null) {
            return null;
        }

        return ActivoDocumento.builder()
                .id(entity.getId())
                .activoId(entity.getActivo() != null ? entity.getActivo().getId() : null)
                .tipoDocumentoId(entity.getTipoDocumento() != null ? entity.getTipoDocumento().getId() : null)
                .numeroDocumento(entity.getNumeroDocumento())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .fechaEmision(entity.getFechaEmision())
                .fechaVencimiento(entity.getFechaVencimiento())
                .nombreArchivo(entity.getNombreArchivo())
                .rutaArchivo(entity.getRutaArchivo())
                .mimeType(entity.getMimeType())
                .size(entity.getSize())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
