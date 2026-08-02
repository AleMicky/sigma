package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.PeriodoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringPeriodoRepository
        extends BaseJpaRepository<
        PeriodoEntity,
        UUID
        > {

    Page<PeriodoEntity> findByGestion_Id(
            UUID gestionId,
            Pageable pageable
    );

    List<PeriodoEntity> findByGestion_IdOrderByPeriodoAsc(UUID gestionId);
}
