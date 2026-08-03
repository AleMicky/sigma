package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import org.springframework.stereotype.Component;

@Component
public class ActivoAtributoPersistenceMapper {

    public ActivoAtributoEntity toEntity(ActivoAtributo domain) {
        if (domain == null) {
            return null;
        }

        ActivoAtributoEntity entity = new ActivoAtributoEntity();
        entity.setId(domain.getId());
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setCodigo(domain.getCodigo());
        entity.setEtiqueta(domain.getEtiqueta());
        entity.setDescripcion(domain.getDescripcion());
        entity.setTipoDatoId(domain.getTipoDatoId());
        entity.setOrden(domain.getOrden());
        entity.setRequerido(domain.getRequerido());
        entity.setVisible(domain.getVisible());
        entity.setEditable(domain.getEditable());
        entity.setValorDefecto(domain.getValorDefecto());
        entity.setOpciones(domain.getOpciones());

        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getCreatedBy() != null) {
            entity.setCreatedBy(domain.getCreatedBy());
        }

        return entity;
    }

    public ActivoAtributo toDomain(ActivoAtributoEntity entity) {
        if (entity == null) {
            return null;
        }

        return ActivoAtributo.builder()
                .id(entity.getId())
                .tipoActivoId(entity.getTipoActivoId())
                .codigo(entity.getCodigo())
                .etiqueta(entity.getEtiqueta())
                .descripcion(entity.getDescripcion())
                .tipoDatoId(entity.getTipoDatoId())
                .orden(entity.getOrden())
                .requerido(entity.getRequerido())
                .visible(entity.getVisible())
                .editable(entity.getEditable())
                .valorDefecto(entity.getValorDefecto())
                .opciones(entity.getOpciones())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
