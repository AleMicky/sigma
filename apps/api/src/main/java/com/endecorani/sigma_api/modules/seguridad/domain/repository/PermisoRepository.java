package com.endecorani.sigma_api.modules.seguridad.domain.repository;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Permiso;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PermisoRepository {

    Optional<Permiso> findById(UUID id);

    Permiso save(Permiso permiso);

    void deleteById(UUID id);

    Page<Permiso> findAll(Pageable pageable);

    List<Permiso> findAll();

    Page<Permiso> findByMenuId(UUID menuId, Pageable pageable);

    List<Permiso> findByMenuId(UUID menuId);

    Page<Permiso> search(String query, Pageable pageable);

    Page<Permiso> searchByMenuId(UUID menuId, String query, Pageable pageable);

    boolean existsById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    boolean existsByMenuId(UUID menuId);
}
