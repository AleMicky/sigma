package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivoRepository extends CrudRepository<Activo, UUID> {

    Page<Activo> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

    Page<Activo> searchByTipoActivoId(
            UUID tipoActivoId,
            String query,
            Pageable pageable
    );

    Page<Activo> search(String query, Pageable pageable);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
