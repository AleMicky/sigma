package com.endecorani.sigma_api.modules.organizacion.domain.repository;

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

    Page<Empleado> findByPersonaId(UUID personaId, Pageable pageable);

    Page<Empleado> findByAreaId(UUID areaId, Pageable pageable);

    Page<Empleado> findByCargoId(UUID cargoId, Pageable pageable);

    Page<Empleado> findByAreaIdAndCargoId(
            UUID areaId,
            UUID cargoId,
            Pageable pageable
    );

    Page<Empleado> findByAreaIdAndPersonaId(
            UUID areaId,
            UUID personaId,
            Pageable pageable
    );

    Page<Empleado> findByCargoIdAndPersonaId(
            UUID cargoId,
            UUID personaId,
            Pageable pageable
    );

    Page<Empleado> findByAreaIdAndCargoIdAndPersonaId(
            UUID areaId,
            UUID cargoId,
            UUID personaId,
            Pageable pageable
    );

    Page<Empleado> search(String query, Pageable pageable);

    Page<Empleado> searchByAreaId(
            UUID areaId,
            String query,
            Pageable pageable
    );

    Page<Empleado> searchByCargoId(
            UUID cargoId,
            String query,
            Pageable pageable
    );

    Page<Empleado> searchByPersonaId(
            UUID personaId,
            String query,
            Pageable pageable
    );

    Page<Empleado> searchByAreaIdAndCargoId(
            UUID areaId,
            UUID cargoId,
            String query,
            Pageable pageable
    );

    Page<Empleado> searchByAreaIdAndPersonaId(
            UUID areaId,
            UUID personaId,
            String query,
            Pageable pageable
    );

    Page<Empleado> searchByCargoIdAndPersonaId(
            UUID cargoId,
            UUID personaId,
            String query,
            Pageable pageable
    );

    Page<Empleado> searchByAreaIdAndCargoIdAndPersonaId(
            UUID areaId,
            UUID cargoId,
            UUID personaId,
            String query,
            Pageable pageable
    );
}