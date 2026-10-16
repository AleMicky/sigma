package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivoEstado;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEstadoEntity;
import org.springframework.stereotype.Component;

@Component
public class TipoActivoEstadoPersistenceMapper {

    public TipoActivoEstadoEntity toEntity(TipoActivoEstado domain) {
        if (domain == null) {
            return null;
        }

        TipoActivoEstadoEntity entity = new TipoActivoEstadoEntity();
        entity.setId(domain.getId());
        entity.setTipoActivoId(domain.getTipoActivoId());
        entity.setEstadoOperativoId(domain.getEstadoOperativoId());
        entity.setPredeterminado(Boolean.TRUE.equals(domain.getPredeterminado()));

        return entity;
    }

    public TipoActivoEstado toDomain(TipoActivoEstadoEntity entity) {
        if (entity == null) {
            return null;
        }

        return TipoActivoEstado.builder()
                .id(entity.getId())
                .tipoActivoId(entity.getTipoActivoId())
                .estadoOperativoId(entity.getEstadoOperativoId())
                .predeterminado(Boolean.TRUE.equals(entity.getPredeterminado()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
