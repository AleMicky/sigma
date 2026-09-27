package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConductorRepository {

    Page<Conductor> findAll(Pageable pageable);

    Page<Conductor> search(String search, Pageable pageable);

    Page<Conductor> searchWithFilters(String search, String categoria, EstadoConductor estado, Boolean activo, Pageable pageable);

    List<Conductor> findDisponibles(LocalDateTime fechaSalida, LocalDateTime fechaRetorno);

    Optional<Conductor> findById(UUID id);

    Conductor save(Conductor conductor);

    void deleteById(UUID id);

    boolean existsByEmpleadoId(UUID empleadoId);

    boolean existsByEmpleadoIdAndIdNot(UUID empleadoId, UUID id);
}
