package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.inventarios.domain.model.InsumoAtributoValor;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoAtributoValorEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoAtributoEntity;
import org.springframework.stereotype.Component;

@Component
public class InsumoAtributoValorPersistenceMapper {

    public InsumoAtributoValorEntity toEntity(InsumoAtributoValor domain) {
        if (domain == null) {
            return null;
        }

        InsumoAtributoValorEntity entity = new InsumoAtributoValorEntity();
        entity.setId(domain.getId());
        entity.setValor(domain.getValor());

        if (domain.getInsumoId() != null) {
            InsumoEntity insumo = new InsumoEntity();
            insumo.setId(domain.getInsumoId());
            entity.setInsumo(insumo);
        }

        if (domain.getTipoInsumoAtributoId() != null) {
            TipoInsumoAtributoEntity atributo = new TipoInsumoAtributoEntity();
            atributo.setId(domain.getTipoInsumoAtributoId());
            entity.setAtributo(atributo);
        }

        return entity;
    }

    public InsumoAtributoValor toDomain(InsumoAtributoValorEntity entity) {
        if (entity == null) {
            return null;
        }

        return InsumoAtributoValor.builder()
                .id(entity.getId())
                .insumoId(
                        entity.getInsumo() != null
                                ? entity.getInsumo().getId()
                                : null
                )
                .tipoInsumoAtributoId(
                        entity.getAtributo() != null
                                ? entity.getAtributo().getId()
                                : null
                )
                .valor(entity.getValor())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
