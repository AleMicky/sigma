package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAccesorio;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import org.springframework.stereotype.Component;

@Component
public class ActivoAccesorioPersistenceMapper {

    public ActivoAccesorioEntity toEntity(ActivoAccesorio domain) {
        if (domain == null) {
            return null;
        }

        ActivoAccesorioEntity entity = new ActivoAccesorioEntity();
        entity.setId(domain.getId());

        if (domain.getActivoId() != null) {
            ActivoEntity activo = new ActivoEntity();
            activo.setId(domain.getActivoId());
            entity.setActivo(activo);
        }

        if (domain.getAccesorioId() != null) {
            AccesorioEntity accesorio = new AccesorioEntity();
            accesorio.setId(domain.getAccesorioId());
            entity.setAccesorio(accesorio);
        }

        entity.setCantidad(domain.getCantidad());
        entity.setNumeroSerie(domain.getNumeroSerie());
        entity.setObservacion(domain.getObservacion());

        return entity;
    }

    public ActivoAccesorio toDomain(ActivoAccesorioEntity entity) {
        if (entity == null) {
            return null;
        }

        return ActivoAccesorio.builder()
                .id(entity.getId())
                .activoId(entity.getActivo() != null ? entity.getActivo().getId() : null)
                .accesorioId(entity.getAccesorio() != null ? entity.getAccesorio().getId() : null)
                .cantidad(entity.getCantidad())
                .numeroSerie(entity.getNumeroSerie())
                .observacion(entity.getObservacion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
