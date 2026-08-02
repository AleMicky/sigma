package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.Catalogo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CatalogoRepository extends CrudRepository<Catalogo, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    Page<Catalogo> search(String query, Pageable pageable);
}
