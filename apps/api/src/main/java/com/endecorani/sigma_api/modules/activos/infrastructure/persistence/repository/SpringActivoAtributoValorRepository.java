package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActivoAtributoValorRepository
        extends BaseJpaRepository<ActivoAtributoValorEntity, UUID> {

    Page<ActivoAtributoValorEntity> findByActivoId(
            UUID activoId,
            Pageable pageable
    );

    boolean existsByActivoIdAndActivoAtributoId(
            UUID activoId,
            UUID activoAtributoId
    );

    boolean existsByActivoIdAndActivoAtributoIdAndIdNot(
            UUID activoId,
            UUID activoAtributoId,
            UUID id
    );
}
