package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoSearchCriteria;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface EmpleadoRepository extends CrudRepository<Empleado, UUID> {

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
