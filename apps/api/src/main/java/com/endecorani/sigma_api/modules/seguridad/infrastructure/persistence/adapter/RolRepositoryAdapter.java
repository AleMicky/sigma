package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class RolRepositoryAdapter implements RolRepository {

    private final RolJpaRepository repository;

    @Override
    public Optional<Rol> findById(UUID id) {
        return repository
                .findById(id)
                .map(this::toDomain);
    }

    @Override
    public Optional<Rol> findByKeycloakRoleId(String keycloakRoleId) {
        return repository
                .findByKeycloakRoleId(keycloakRoleId)
                .map(this::toDomain);
    }

    @Override
    public Optional<Rol> findByCodigo(String codigo) {
        return repository
                .findByCodigoIgnoreCase(codigo)
                .map(this::toDomain);
    }

    @Override
    public Rol save(Rol rol) {
        RolEntity entity = toEntity(rol);
        RolEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<Rol> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public org.springframework.data.domain.Page<Rol> findAll(org.springframework.data.domain.Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::toDomain);
    }

    @Override
    public org.springframework.data.domain.Page<Rol> search(String query, org.springframework.data.domain.Pageable pageable) {
        return repository.search(query, pageable)
                .map(this::toDomain);
    }

    private Rol toDomain(RolEntity entity) {

        return Rol.builder()
                .id(entity.getId())
                .keycloakRoleId(entity.getKeycloakRoleId())
                .codigo(entity.getCodigo())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();

    }

    private RolEntity toEntity(Rol rol) {
        return RolEntity.builder()
                .id(rol.getId())
                .keycloakRoleId(rol.getKeycloakRoleId())
                .codigo(rol.getCodigo())
                .nombre(rol.getNombre())
                .descripcion(rol.getDescripcion())
                .activo(rol.isActivo())
                .build();
    }
}
