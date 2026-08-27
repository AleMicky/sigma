package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Menu;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.MenuRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.MenuEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.mapper.MenuPersistenceMapper;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.MenuJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class MenuRepositoryAdapter implements MenuRepository {

    private final MenuJpaRepository repository;

    private final MenuPersistenceMapper mapper;

    @Override
    public Optional<Menu> findById(UUID id) {
        return repository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Menu save(Menu menu) {
        MenuEntity entity = mapper.toEntity(menu);
        MenuEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public List<Menu> findAll() {
        return repository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<Menu> findAll(Pageable pageable) {
        return repository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Menu> search(String query, Pageable pageable) {
        return repository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<Menu> findByMenuPadreId(UUID menuPadreId) {
        return repository
                .findByMenuPadreId(menuPadreId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Menu> findByMenuPadreIdIsNull() {
        return repository
                .findByMenuPadreIdIsNull()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsById(UUID id) {
        return repository.existsById(id);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return repository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
        return repository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public boolean existsByMenuPadreId(UUID menuPadreId) {
        return repository.existsByMenuPadreId(menuPadreId);
    }
}
