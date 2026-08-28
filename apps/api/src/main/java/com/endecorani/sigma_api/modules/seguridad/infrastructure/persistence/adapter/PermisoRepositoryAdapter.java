package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Permiso;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.PermisoRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.PermisoEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.mapper.PermisoPersistenceMapper;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.PermisoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PermisoRepositoryAdapter implements PermisoRepository {

    private final PermisoJpaRepository repository;
    private final PermisoPersistenceMapper mapper;

    @Override
    public Optional<Permiso> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Permiso save(Permiso permiso) {
        PermisoEntity entity = mapper.toEntity(permiso);
        PermisoEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public Page<Permiso> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public List<Permiso> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<Permiso> findByMenuId(UUID menuId, Pageable pageable) {
        return repository.findByMenuId(menuId, pageable).map(mapper::toDomain);
    }

    @Override
    public List<Permiso> findByMenuId(UUID menuId) {
        return repository.findByMenuId(menuId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<Permiso> search(String query, Pageable pageable) {
        return repository.search(query, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<Permiso> searchByMenuId(UUID menuId, String query, Pageable pageable) {
        return repository.searchByMenuId(menuId, query, pageable).map(mapper::toDomain);
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
    public boolean existsByMenuId(UUID menuId) {
        return repository.existsByMenuId(menuId);
    }
}
