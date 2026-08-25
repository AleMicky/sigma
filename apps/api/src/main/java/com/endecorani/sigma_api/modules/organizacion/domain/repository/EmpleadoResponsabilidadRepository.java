package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.EmpleadoResponsabilidad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmpleadoResponsabilidadRepository {

    EmpleadoResponsabilidad save(EmpleadoResponsabilidad empleadoResponsabilidad);

    Optional<EmpleadoResponsabilidad> findById(UUID id);

    Page<EmpleadoResponsabilidad> findAll(Pageable pageable);

    List<EmpleadoResponsabilidad> findByResponsabilidadId(UUID responsabilidadId);

    Page<EmpleadoResponsabilidad> findByResponsabilidadId(
            UUID responsabilidadId,
            Pageable pageable
    );

    void deleteById(UUID id);
}
