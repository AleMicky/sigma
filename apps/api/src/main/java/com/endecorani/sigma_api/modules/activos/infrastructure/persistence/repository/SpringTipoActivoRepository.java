package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;

import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringTipoActivoRepository
        extends BaseJpaRepository<
        TipoActivoEntity,
        UUID
        > {

    boolean existsByNombreIgnoreCase(
            String nombre
    );

    boolean existsByNombreIgnoreCaseAndIdNot(
            String nombre,
            UUID id
    );

}