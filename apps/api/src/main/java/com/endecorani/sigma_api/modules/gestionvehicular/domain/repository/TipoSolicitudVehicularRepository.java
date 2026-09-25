package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface TipoSolicitudVehicularRepository {

    Page<TipoSolicitudVehicular> findAll(Pageable pageable);

    Page<TipoSolicitudVehicular> search(String search, Pageable pageable);

    Optional<TipoSolicitudVehicular> findById(UUID id);

    Optional<TipoSolicitudVehicular> findByCodigo(String codigo);

    TipoSolicitudVehicular save(TipoSolicitudVehicular tipoSolicitudVehicular);

    void deleteById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
