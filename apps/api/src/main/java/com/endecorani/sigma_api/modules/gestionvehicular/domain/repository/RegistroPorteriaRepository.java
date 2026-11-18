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

    /**
     * Lista los registros en estado AFUERA.
     *
     * @param areaId      si no es {@code null}, restringe a funcionarios de esa área (sección).
     * @param createdById si no es {@code null}, incluye (o restringe a) registros creados por este usuario.
     */
    List<RegistroPorteria> findAfuera(UUID areaId, UUID createdById);

    /**
     * @param areaId      si no es {@code null}, restringe a funcionarios de esa área (sección).
     * @param createdById si no es {@code null}, incluye (o restringe a) registros creados por este usuario.
     * @param unirPorOr   {@code true} si {@code areaId} y {@code createdById} se unen por OR (alcance de usuario no-admin);
     *                    {@code false} si se unen por AND (filtros explícitos de admin).
     */
    Page<RegistroPorteria> findAll(
            String search,
            UUID empleadoId,
            UUID activoId,
            UUID areaId,
            UUID createdById,
            boolean unirPorOr,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta,
            Pageable pageable
    );
}

