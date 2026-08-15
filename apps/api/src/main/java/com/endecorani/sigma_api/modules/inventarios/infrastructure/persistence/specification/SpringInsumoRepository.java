package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringInsumoRepository
        extends BaseJpaRepository<
        InsumoEntity,
        UUID
        > {
}
