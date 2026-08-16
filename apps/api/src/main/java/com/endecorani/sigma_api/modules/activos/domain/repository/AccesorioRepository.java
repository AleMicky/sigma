package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccesorioRepository {

    Accesorio save(Accesorio accesorio);

    Optional<Accesorio> findById(UUID id);

    List<Accesorio> findAll();

    Page<Accesorio> findAll(Pageable pageable);

    Page<Accesorio> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);

    Page<Accesorio> search(
            String query,
            Pageable pageable
    );

    Page<Accesorio> searchByTipoActivoId(
            UUID tipoActivoId,
            String query,
            Pageable pageable
    );

    boolean existsByTipoActivoIdAndCodigoIgnoreCase(
            UUID tipoActivoId,
            String codigo
    );

    boolean existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoActivoId,
            String codigo,
            UUID id
    );
}
