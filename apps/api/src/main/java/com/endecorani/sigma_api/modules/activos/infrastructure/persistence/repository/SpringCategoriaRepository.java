package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.CategoriaEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringCategoriaRepository
        extends BaseJpaRepository<
        CategoriaEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(
            String codigo
    );

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

}
