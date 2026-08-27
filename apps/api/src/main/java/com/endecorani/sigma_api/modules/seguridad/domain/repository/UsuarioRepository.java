package com.endecorani.sigma_api.modules.seguridad.domain.repository;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository {
    Optional<Usuario> findById(UUID id);

    Optional<Usuario> findByKeycloakUserId(String keycloakUserId);

    Usuario save(Usuario usuario);

    List<Usuario> findAll();

    Page<Usuario> findAll(Pageable pageable);
}