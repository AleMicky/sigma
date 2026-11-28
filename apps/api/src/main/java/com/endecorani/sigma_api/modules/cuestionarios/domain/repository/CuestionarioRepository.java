package com.endecorani.sigma_api.modules.cuestionarios.domain.repository;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CuestionarioRepository {

    Cuestionario save(Cuestionario cuestionario);

    Cuestionario saveAndFlush(Cuestionario cuestionario);

    Optional<Cuestionario> findById(UUID id);

    List<Cuestionario> findAllById(Collection<UUID> ids);

    Page<Cuestionario> search(
            String q,
            String moduloOrigen,
            EstadoCuestionario estado,
            Boolean activo,
            Pageable pageable
    );

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    Optional<Cuestionario> findPublishedActiveByDisparador(
            String moduloOrigen,
            String entidadTipo,
            String eventoDisparador
    );

    List<Cuestionario> findPublishedActiveByDisparadorExcludingId(
            String moduloOrigen,
            String entidadTipo,
            String eventoDisparador,
            UUID excludeId
    );

    void deleteById(UUID id);
}
