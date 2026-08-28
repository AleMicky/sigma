package com.endecorani.sigma_api.modules.seguridad.domain.repository;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Menu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuRepository {

    Optional<Menu> findById(UUID id);

    Menu save(Menu menu);

    void deleteById(UUID id);

    List<Menu> findAll();

    List<Menu> findAllById(List<UUID> ids);

    Page<Menu> findAll(Pageable pageable);

    Page<Menu> search(String query, Pageable pageable);

    List<Menu> findByMenuPadreId(UUID menuPadreId);

    List<Menu> findByMenuPadreIdIsNull();

    boolean existsById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    boolean existsByMenuPadreId(UUID menuPadreId);
}
