package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.GestionEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringGestionRepository
        extends BaseJpaRepository<
        GestionEntity,
        UUID
        > {

    boolean existsByGestion(Integer gestion);

    boolean existsByGestionAndIdNot(
            Integer gestion,
            UUID id
    );

    Page<GestionEntity> findByGestion(
            Integer gestion,
            Pageable pageable
    );
}
