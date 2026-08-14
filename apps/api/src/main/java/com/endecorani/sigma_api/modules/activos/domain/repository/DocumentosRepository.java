package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Documentos;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DocumentosRepository extends CrudRepository<Documentos, UUID> {

    Page<Documentos> findAll(
            DocumentosSearchCriteria criteria,
            Pageable pageable
    );
}
