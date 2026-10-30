package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoCriterioEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProgramacionMantenimientoPersistenceMapper {

    private final ProgramacionMantenimientoCriterioPersistenceMapper criterioMapper;

    public ProgramacionMantenimientoEntity toEntity(ProgramacionMantenimiento domain) {
        if (domain == null) {
            return null;
        }

        ProgramacionMantenimientoEntity entity = new ProgramacionMantenimientoEntity();
        entity.setId(domain.getId());
        entity.setPlanMantenimientoActivoId(domain.getPlanMantenimientoActivoId());
        entity.setActivo(domain.getActivo() != null ? domain.getActivo() : true);

        if (domain.getCriterios() != null) {
            List<ProgramacionMantenimientoCriterioEntity> criteriosEntities = domain.getCriterios().stream()
                    .map(criterioMapper::toEntity)
                    .collect(Collectors.toList());
            entity.setCriterios(criteriosEntities);
        } else {
            entity.setCriterios(new ArrayList<>());
        }

        return entity;
    }

    public ProgramacionMantenimiento toDomain(ProgramacionMantenimientoEntity entity) {
        if (entity == null) {
            return null;
        }

        List<ProgramacionMantenimientoCriterio> criteriosDomain = new ArrayList<>();
        if (entity.getCriterios() != null && org.hibernate.Hibernate.isInitialized(entity.getCriterios())) {
            criteriosDomain = entity.getCriterios().stream()
                    .map(criterioMapper::toDomain)
                    .collect(Collectors.toList());
        }

        return ProgramacionMantenimiento.builder()
                .id(entity.getId())
                .planMantenimientoActivoId(entity.getPlanMantenimientoActivoId())
                .activo(entity.getActivo())
                .criterios(criteriosDomain)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }
}
