package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoItemEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringCatalogoItemRepository
        extends BaseJpaRepository<
        CatalogoItemEntity,
        UUID
        > {

    Page<CatalogoItemEntity> findByCatalogo_Id(
            UUID catalogoId,
            Pageable pageable
    );

    boolean existsByCatalogo_IdAndValorIgnoreCase(
            UUID catalogoId,
            String valor
    );

    boolean existsByCatalogo_IdAndValorIgnoreCaseAndIdNot(
            UUID catalogoId,
            String valor,
            UUID id
    );
}
