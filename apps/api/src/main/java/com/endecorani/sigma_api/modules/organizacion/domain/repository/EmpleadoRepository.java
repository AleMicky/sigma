package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoSearchCriteria;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface EmpleadoRepository {

    Empleado save(Empleado empleado);

    Optional<Empleado> findById(UUID id);

    Page<Empleado> findAll(Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    Page<Empleado> findAll(
            EmpleadoSearchCriteria criteria,
            Pageable pageable
    );
}