package com.endecorani.sigma_api.modules.activos.domain.repository;


import com.endecorani.sigma_api.modules.activos.domain.model.TiposDocumento;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;


public interface TiposDocumentoRepository extends CrudRepository<TiposDocumento, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    Page<TiposDocumento> search(String query, Pageable pageable);
}