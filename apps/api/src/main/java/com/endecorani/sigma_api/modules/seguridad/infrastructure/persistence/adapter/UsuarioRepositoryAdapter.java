package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.PersonaEntity;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UsuarioRepositoryAdapter implements UsuarioRepository {

    private final UsuarioJpaRepository repository;

    @Override
    public Optional<Usuario> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Usuario> findByKeycloakUserId(String keycloakUserId) {
        return repository
                .findByKeycloakUserId(keycloakUserId)
                .map(this::toDomain);
    }

    @Override
    public Optional<Usuario> findByUsernameIgnoreCase(String username) {
        return repository
                .findByUsernameIgnoreCase(username)
                .map(this::toDomain);
    }

    @Override
    public Optional<Usuario> findByPersonaId(UUID personaId) {
        return repository
                .findByPersonaId(personaId)
                .map(this::toDomain);
    }

    @Override
    public boolean existsByPersonaId(UUID personaId) {
        return repository.existsByPersonaId(personaId);
    }

    @Override
    public boolean existsByPersonaIdAndIdNot(UUID personaId, UUID id) {
        return repository.existsByPersonaIdAndIdNot(personaId, id);
    }

    @Override
    public Usuario save(Usuario usuario) {
        UsuarioEntity entity;
        if (usuario.getId() != null) {
            entity = repository.findById(usuario.getId())
                    .map(existing -> {
                        existing.setKeycloakUserId(usuario.getKeycloakUserId());
                        existing.setUsername(usuario.getUsername());
                        existing.setNombre(usuario.getNombre());
                        existing.setEmail(usuario.getEmail());
                        existing.setActivo(usuario.isActivo());
                        if (usuario.getPersonaId() != null) {
                            PersonaEntity persona = new PersonaEntity();
                            persona.setId(usuario.getPersonaId());
                            existing.setPersona(persona);
                        } else {
                            existing.setPersona(null);
                        }
                        return existing;
                    })
                    .orElseGet(() -> toEntity(usuario));
        } else {
            entity = toEntity(usuario);
        }

        UsuarioEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<Usuario> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Page<Usuario> findAll(Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::toDomain);
    }

    @Override
    public Page<Usuario> search(String query, Pageable pageable) {
        return repository.search(query, pageable)
                .map(this::toDomain);
    }

    private Usuario toDomain(UsuarioEntity entity) {
        return Usuario.builder()
                .id(entity.getId())
                .keycloakUserId(entity.getKeycloakUserId())
                .username(entity.getUsername())
                .nombre(entity.getNombre())
                .email(entity.getEmail())
                .personaId(entity.getPersona() != null ? entity.getPersona().getId() : null)
                .activo(entity.isActivo())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdById(entity.getCreatedById())
                .updatedById(entity.getUpdatedById())
                .build();
    }

    private UsuarioEntity toEntity(Usuario usuario) {
        PersonaEntity persona = null;
        if (usuario.getPersonaId() != null) {
            persona = new PersonaEntity();
            persona.setId(usuario.getPersonaId());
        }

        return UsuarioEntity.builder()
                .id(usuario.getId())
                .keycloakUserId(usuario.getKeycloakUserId())
                .username(usuario.getUsername())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .persona(persona)
                .activo(usuario.isActivo())
                .build();
    }
}
