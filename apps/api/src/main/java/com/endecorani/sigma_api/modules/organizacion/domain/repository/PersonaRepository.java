package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PersonaRepository extends CrudRepository<Persona, UUID> {

    boolean existsByDocumento(
            String tipoDocumento,
            String numeroDocumento,
            String complemento
    );

    boolean existsByDocumentoAndIdNot(
            String tipoDocumento,
            String numeroDocumento,
            String complemento,
            UUID id
    );

    Page<Persona> search(String query, Pageable pageable);
}