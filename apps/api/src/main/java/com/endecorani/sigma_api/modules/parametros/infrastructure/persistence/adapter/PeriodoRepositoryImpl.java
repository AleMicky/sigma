package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.parametros.domain.model.Periodo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.PeriodoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.PeriodoEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.PeriodoPersistenceMapper;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringPeriodoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PeriodoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Periodo,
        PeriodoEntity,
        UUID
        >
        implements PeriodoRepository {

    private final SpringPeriodoRepository springRepository;

    private final PeriodoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            PeriodoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected PeriodoEntity toEntity(Periodo domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Periodo toDomain(PeriodoEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<Periodo> findByGestionId(
            UUID gestionId,
            Pageable pageable
    ) {
        return springRepository
                .findByGestion_Id(gestionId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<Periodo> findAllByGestionId(UUID gestionId) {
        return springRepository
                .findByGestion_IdOrderByPeriodoAsc(gestionId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Periodo> saveAll(List<Periodo> periodos) {
        List<PeriodoEntity> entities = periodos.stream()
                .map(mapper::toEntity)
                .toList();

        return springRepository
                .saveAll(entities)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}
