package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Documentos;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface DocumentosRepository extends CrudRepository<Documentos, UUID> {

    Page<Documentos> findByActivoId(UUID activoId, Pageable pageable);

    Page<Documentos> findByTipoDocumentoId(UUID tipoDocumentoId, Pageable pageable);

    Page<Documentos> findByActivoIdAndTipoDocumentoId(
            UUID activoId,
            UUID tipoDocumentoId,
            Pageable pageable
    );

    Page<Documentos> search(String query, Pageable pageable);

    Page<Documentos> searchByActivoId(
            UUID activoId,
            String query,
            Pageable pageable
    );

    Page<Documentos> searchByTipoDocumentoId(
            UUID tipoDocumentoId,
            String query,
            Pageable pageable
    );

    Page<Documentos> searchByActivoIdAndTipoDocumentoId(
            UUID activoId,
            UUID tipoDocumentoId,
            String query,
            Pageable pageable
    );
}