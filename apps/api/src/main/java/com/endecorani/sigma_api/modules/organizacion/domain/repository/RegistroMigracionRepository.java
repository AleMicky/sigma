package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.RegistroMigracion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface RegistroMigracionRepository {

    Optional<RegistroMigracion> findById(UUID id);

    Page<RegistroMigracion> findAll(
            String sistemaOrigen,
            String entidad,
            String estado,
            java.time.Instant fechaDesde,
            java.time.Instant fechaHasta,
            String query,
            Pageable pageable
    );
}