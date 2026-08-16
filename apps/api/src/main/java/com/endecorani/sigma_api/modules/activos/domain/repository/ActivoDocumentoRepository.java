package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoDocumento;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivoDocumentoRepository extends CrudRepository<ActivoDocumento, UUID> {

    Page<ActivoDocumento> findAll(ActivoDocumentoSearchCriteria criteria, Pageable pageable);

}
