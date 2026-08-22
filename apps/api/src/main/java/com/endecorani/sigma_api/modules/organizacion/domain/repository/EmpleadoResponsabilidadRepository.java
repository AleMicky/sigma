package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.EmpleadoResponsabilidad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface EmpleadoResponsabilidadRepository {

    EmpleadoResponsabilidad save(EmpleadoResponsabilidad empleadoResponsabilidad);

    Optional<EmpleadoResponsabilidad> findById(UUID id);

    Page<EmpleadoResponsabilidad> findByEmpleadoId(
            UUID empleadoId,
            Pageable pageable
    );

    void deleteById(UUID id);
}
