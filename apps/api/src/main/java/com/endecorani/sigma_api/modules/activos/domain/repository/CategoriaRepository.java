package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;

import java.util.UUID;

public interface CategoriaRepository extends CrudRepository<Categoria, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

}
