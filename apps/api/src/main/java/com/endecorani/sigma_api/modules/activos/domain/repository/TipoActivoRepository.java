package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;

import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;

import java.util.UUID;

public interface TipoActivoRepository extends CrudRepository<TipoActivo, UUID> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(
            String nombre,
            UUID id
    );

}