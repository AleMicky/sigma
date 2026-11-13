package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RegistroPorteriaRepository {

    RegistroPorteria save(RegistroPorteria registro);

    Optional<RegistroPorteria> findById(UUID id);

    List<RegistroPorteria> findAfuera();

    Page<RegistroPorteria> findAll(
            String search,
            UUID empleadoId,
            UUID activoId,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta,
            Pageable pageable
    );
}

