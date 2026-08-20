package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoAtributoValorEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringInsumoAtributoValorRepository
        extends BaseJpaRepository<
        InsumoAtributoValorEntity,
        UUID
        > {

    Page<InsumoAtributoValorEntity> findByInsumo_Id(
            UUID insumoId,
            Pageable pageable
    );

    boolean existsByInsumo_IdAndAtributo_Id(
            UUID insumoId,
            UUID tipoInsumoAtributoId
    );

    boolean existsByInsumo_IdAndAtributo_IdAndIdNot(
            UUID insumoId,
            UUID tipoInsumoAtributoId,
            UUID id
    );
}
