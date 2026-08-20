package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.parametros.domain.model.Correlativo;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CorrelativoEntity;
import org.springframework.stereotype.Component;

@Component
public class CorrelativoPersistenceMapper {

    public Correlativo toDomain(CorrelativoEntity entity) {
        if (entity == null) {
            return null;
        }

        return Correlativo.builder()
                .id(entity.getId())
                .codigo(entity.getCodigo())
                .gestion(entity.getGestion())
                .ultimoNumero(entity.getUltimoNumero())
                .prefijo(entity.getPrefijo())
                .longitud(entity.getLongitud())
                .build();
    }

    public CorrelativoEntity toEntity(Correlativo model) {
        if (model == null) {
            return null;
        }

        CorrelativoEntity entity = new CorrelativoEntity();
        entity.setId(model.getId());
        entity.setCodigo(model.getCodigo());
        entity.setGestion(model.getGestion());
        entity.setUltimoNumero(model.getUltimoNumero());
        entity.setPrefijo(model.getPrefijo());
        entity.setLongitud(model.getLongitud());

        return entity;
    }
}
