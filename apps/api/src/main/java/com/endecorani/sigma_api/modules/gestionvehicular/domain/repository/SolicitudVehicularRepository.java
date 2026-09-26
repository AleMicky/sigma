package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface SolicitudVehicularRepository {

    Page<SolicitudVehicular> findAll(Pageable pageable);

    Page<SolicitudVehicular> search(String search, Pageable pageable);

    Page<SolicitudVehicular> searchWithFilters(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            Pageable pageable
    );

    Optional<SolicitudVehicular> findById(UUID id);

    Optional<SolicitudVehicular> findByNumero(String numero);

    SolicitudVehicular save(SolicitudVehicular solicitudVehicular);

    void deleteById(UUID id);

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id);
}
