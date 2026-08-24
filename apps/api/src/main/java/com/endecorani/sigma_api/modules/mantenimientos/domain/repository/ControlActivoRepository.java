package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ControlActivoRepository {

    ControlActivo save(ControlActivo entity);

    Optional<ControlActivo> findById(UUID id);

    List<ControlActivo> findAll();

    Page<ControlActivo> findAll(Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
