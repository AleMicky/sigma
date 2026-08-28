package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumoAtributo;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoAtributoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoInsumoAtributoPersistenceMapper {

    public TipoInsumoAtributoEntity toEntity(TipoInsumoAtributo domain) {
        if (domain == null) {
            return null;
        }

        TipoInsumoAtributoEntity entity = new TipoInsumoAtributoEntity();
        entity.setId(domain.getId());
        entity.setTipoDatoId(domain.getTipoDatoId());
        entity.setTipoInsumoId(domain.getTipoInsumoId());
        entity.setCodigo(domain.getCodigo());
        entity.setNombre(domain.getNombre());
        entity.setOrden(domain.getOrden());
        entity.setRequerido(domain.getRequerido());
        entity.setOpciones(domain.getOpciones());

        return entity;
    }

    public TipoInsumoAtributo toDomain(TipoInsumoAtributoEntity entity) {
        if (entity == null) {
            return null;
        }

        return TipoInsumoAtributo.builder()
                .id(entity.getId())
                .tipoDatoId(entity.getTipoDatoId())
                .tipoInsumoId(entity.getTipoInsumoId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .requerido(entity.getRequerido())
                .orden(entity.getOrden())
                .opciones(entity.getOpciones())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
